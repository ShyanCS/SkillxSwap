const MatchRequest = require('../models/MatchRequest');
const UserSkill = require('../models/UserSkill');

// 📌 Send or Update a match request
exports.sendMatchRequest = async (req, res) => {
  try {
    const { receiverId, skillsOffered, skillsRequested } = req.body;

    if (!receiverId || !skillsOffered?.length || !skillsRequested?.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Prevent sending request to self
    if (receiverId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    // Check if a request already exists
    let existingRequest = await MatchRequest.findOne({
      senderId: req.user._id,
      receiverId,
      status: { $in: ['Pending', 'Accepted'] }
    });

    // Fetch UserSkill IDs for offered skills
    // Fetch UserSkill IDs for offered skills (sender’s skills)
    const offeredIds = await Promise.all(
      skillsOffered.map(async (skill) => {
        const us = await UserSkill.findOne({ skillId: skill._id, userId: req.user._id });
        if (!us) throw new Error(`Offered UserSkill not found: ${skill.name}`);
        return us._id;
      })
    );

    // Fetch UserSkill IDs for requested skills (receiver’s skills)
    const requestedIds = await Promise.all(
      skillsRequested.map(async (skill) => {
        const us = await UserSkill.findOne({ skillId: skill._id, userId: receiverId });
        if (!us) throw new Error(`Receiver does not have requested skill: ${skill.name}`);
        return us._id;
      })
    );


    if (existingRequest) {
      // Merge new skills without duplicates
      existingRequest.skillsOffered = Array.from(new Set([...existingRequest.skillsOffered, ...offeredIds]));
      existingRequest.skillsRequested = Array.from(new Set([...existingRequest.skillsRequested, ...requestedIds]));

      await existingRequest.save();

      // Populate before sending back
      await existingRequest.populate('receiverId', 'name email profilePictureUrl karmaPoints');
      await existingRequest.populate('senderId', 'name email profilePictureUrl karmaPoints');
      await existingRequest.populate('skillsOffered', 'skillId');
      await existingRequest.populate('skillsRequested', 'skillId');

      return res.status(200).json({
        message: 'Request updated with new skills.',
        request: existingRequest
      });
    }

    // Create a new request
    let newRequest = await MatchRequest.create({
      senderId: req.user._id,
      receiverId,
      skillsOffered: offeredIds,
      skillsRequested: requestedIds
    });

    // Populate after creation
    await newRequest.populate('receiverId', 'name email profilePictureUrl karmaPoints');
    await newRequest.populate('senderId', 'name email profilePictureUrl karmaPoints');
    await newRequest.populate('skillsOffered', 'skillId');
    await newRequest.populate('skillsRequested', 'skillId');

    res.status(201).json({
      message: 'New request created.',
      request: newRequest
    });

  } catch (error) {
    console.error("Error sending match request:", error);
    res.status(500).json({ message: error.message });
  }
};


// 📌 Get incoming match requests
exports.getIncomingRequests = async (req, res) => {
  try {
    const requests = await MatchRequest.find({ receiverId: req.user._id })
      .populate('senderId', 'name profilePictureUrl')  // only needed fields
      .populate({
        path: 'skillsOffered',
        populate: { path: 'skillId', select: 'name' }
      })
      .populate({
        path: 'skillsRequested',
        populate: { path: 'skillId', select: 'name' }
      });
    // Map to frontend-friendly structure
    const formattedRequests = requests.map(reqDoc => ({
      id: reqDoc._id.toString(),
      sender: {
        id: reqDoc.senderId._id.toString(),
        name: reqDoc.senderId.name,
        profilePictureUrl: reqDoc.senderId.profilePictureUrl
        // Optionally add karmaPoints if you want
      },
      skillOffered: reqDoc.skillsOffered.map(s => ({
        name: s.skillId.name,
        proficiencyLevel: s.desiredProficiency || 'N/A',  // from UserSkill
        availability: s.availability || []    
        // Optionally add proficiencyLevel here if available
      })),
      skillWanted: reqDoc.skillsRequested.map(s => ({
        name: s.skillId.name,
        desiredProficiency: s.desiredProficiency || 'N/A', // from UserSkill
        urgency: s.urgency || 'Medium'
      })),
      sentAt: reqDoc.createdAt,
      status: reqDoc.status.toLowerCase()  // pending, accepted, rejected
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error("Error fetching incoming requests:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.getSentRequests = async (req, res) => {
  try {
    const requests = await MatchRequest.find({ senderId: req.user._id })
      .populate('receiverId', 'name profilePictureUrl') // only needed fields
      .populate({
        path: 'skillsOffered',
        populate: { path: 'skillId', select: 'name' }
      })
      .populate({
        path: 'skillsRequested',
        populate: { path: 'skillId', select: 'name' }
      });
      console.log(requests[0].skillsOffered);
    // Map to frontend-friendly structure
    const formattedRequests = requests.map(reqDoc => ({
      id: reqDoc._id.toString(),
      recipient: {
        id: reqDoc.receiverId._id.toString(),
        name: reqDoc.receiverId.name,
        profilePictureUrl: reqDoc.receiverId.profilePictureUrl
      },
      skillOffered: reqDoc.skillsOffered.map(s => ({
        name: s.skillId?.name,
        proficiencyLevel: s.desiredProficiency || 'N/A',  // from UserSkill
        availability: s.availability || []              // optional, if you want to send
      })),
      skillWanted: reqDoc.skillsRequested.map(s => ({
        name: s.skillId?.name,
        desiredProficiency: s.desiredProficiency || 'N/A', // from UserSkill
        urgency: s.urgency || 'Medium'                     // optional
      })),
      sentAt: reqDoc.createdAt,
      status: reqDoc.status.toLowerCase() // pending, accepted, rejected
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📌 Respond to a match request (Accept/Reject)
exports.respondToRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'Accepted' or 'Rejected'
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await MatchRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Only the receiver can respond
    if (request.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    res.json({ message: `Request ${status}`, request });
  } catch (error) {
    console.error("Error responding to request:", error);
    res.status(500).json({ message: error.message });
  }
};
