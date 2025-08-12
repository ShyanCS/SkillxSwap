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

    // Check if request already exists
    let existingRequest = await MatchRequest.findOne({
      senderId: req.user._id,
      receiverId,
      status: { $in: ['Pending', 'Accepted'] }
    });

    // Fetch offered skills
    const offeredDetails = await Promise.all(
      skillsOffered.map(async (id) => {
        const us = await UserSkill.findById(id).populate('skillId');
        if (!us) throw new Error(`Offered UserSkill not found: ${id}`);
        return {
          userSkillId: us._id,
          skillId: us.skillId._id,
          skillName: us.skillId.name
        };
      })
    );

    // Fetch requested skills
    const requestedDetails = await Promise.all(
      skillsRequested.map(async (id) => {
        const us = await UserSkill.findById(id).populate('skillId');
        if (!us) throw new Error(`Requested UserSkill not found: ${id}`);
        return {
          userSkillId: us._id,
          skillId: us.skillId._id,
          skillName: us.skillId.name
        };
      })
    );

    if (existingRequest) {
      // Merge skills without duplicates
      const mergeUnique = (existing, incoming) => {
        const map = new Map(existing.map(s => [s.skillId.toString(), s]));
        incoming.forEach(s => {
          if (!map.has(s.skillId.toString())) {
            map.set(s.skillId.toString(), s);
          }
        });
        return Array.from(map.values());
      };

      existingRequest.skillsOffered = mergeUnique(existingRequest.skillsOffered, offeredDetails);
      existingRequest.skillsRequested = mergeUnique(existingRequest.skillsRequested, requestedDetails);

      await existingRequest.save();

      // Populate before sending back
      existingRequest = await existingRequest.populate('receiverId', 'name email profilePictureUrl karmaPoints');
      existingRequest = await existingRequest.populate('senderId', 'name email profilePictureUrl karmaPoints');

      return res.status(200).json({
        message: 'Request updated with new skills.',
        request: existingRequest
      });
    }

    // Create a new request
    let newRequest = await MatchRequest.create({
      senderId: req.user._id,
      receiverId,
      skillsOffered: offeredDetails,
      skillsRequested: requestedDetails
    });

    // Populate after creation
    newRequest = await newRequest.populate('receiverId', 'name email profilePictureUrl karmaPoints');
    newRequest = await newRequest.populate('senderId', 'name email profilePictureUrl karmaPoints');

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
      .populate('senderId', 'name email profilePictureUrl karmaPoints');
    res.json(requests);
  } catch (error) {
    console.error("Error fetching incoming requests:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📌 Get sent match requests
exports.getSentRequests = async (req, res) => {
  try {
    const requests = await MatchRequest.find({ senderId: req.user._id })
      .populate('receiverId', 'name email profilePictureUrl karmaPoints');
    res.json(requests);
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
