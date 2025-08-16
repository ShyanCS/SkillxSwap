const User = require('../models/User');
const UserSkill = require('../models/UserSkill');
const Skill = require('../models/Skill');

exports.matches = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // 1. Get skills current user wants to learn & can teach
    const [requestedSkills, offeredSkills] = await Promise.all([
      UserSkill.find({ userId: currentUserId, type: 'request' }).populate('skillId'),
      UserSkill.find({ userId: currentUserId, type: 'offer' }).populate('skillId')
    ]);

    const requestedSkillIds = requestedSkills.map(us => us.skillId._id.toString());
    const offeredSkillIds = offeredSkills.map(us => us.skillId._id.toString());

    // 2. Find matching UserSkills from others
    const [matchesByRequest, matchesByOffer] = await Promise.all([
      UserSkill.find({
        type: 'offer',
        skillId: { $in: requestedSkillIds },
        userId: { $ne: currentUserId }
      }).populate('skillId userId'),

      UserSkill.find({
        type: 'request',
        skillId: { $in: offeredSkillIds },
        userId: { $ne: currentUserId }
      }).populate('skillId userId')
    ]);

    // 3. Aggregate by matched user
    const compatibilityMap = new Map();

    function addSkillMatch(userSkill, type) {
      const userId = userSkill.userId._id.toString();

      if (!compatibilityMap.has(userId)) {
        compatibilityMap.set(userId, {
          user: userSkill.userId,
          skillsOffered: [],
          skillsRequested: [],
          compatibilityScore: 0,
          skillMatchSet: new Set()
        });
      }

      const entry = compatibilityMap.get(userId);

      if (type === 'offer') {
        // They offer a skill I want
        entry.skillsOffered.push({
          id: userSkill.skillId,
          name: userSkill.skillId.name,
          proficiencyLevel: userSkill.proficiencyLevel,
          description: userSkill.description || userSkill.skillId.description
        });
      } else {
        // They want a skill I offer
        entry.skillsRequested.push({
          id: userSkill.skillId,
          name: userSkill.skillId.name,
          desiredProficiency: userSkill.desiredProficiency,
          description: userSkill.description || userSkill.skillId.description
        });
      }

      entry.skillMatchSet.add(userSkill.skillId.name);
      entry.compatibilityScore++;
    }

    matchesByRequest.forEach(match => addSkillMatch(match, 'offer'));
    matchesByOffer.forEach(match => addSkillMatch(match, 'request'));

    // 4. Format result
    const result = [];

    for (const [_, entry] of compatibilityMap.entries()) {
      if (entry.skillsOffered.length && entry.skillsRequested.length) {
        result.push({
          id: entry.user._id,
          user: {
            id: entry.user._id,
            name: entry.user.name,
            bio: entry.user.bio,
            region: entry.user.region,
            timezone: entry.user.timezone,
            profilePictureUrl: entry.user.profilePictureUrl,
            karmaPoints: entry.user.karmaPoints || 0,
            rating: entry.user.rating || 0
          },
          skillsOffered: entry.skillsOffered,
          skillsRequested: entry.skillsRequested,
          compatibilityScore: entry.compatibilityScore,
          mutualInterests: Array.from(entry.skillMatchSet),
          lastActive: 'Just now' // Replace with actual activity time if available
        });
      }
    }

    result.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    res.status(200).json(result);
  } catch (err) {
    console.error('Matching error:', err);
    res.status(500).json({ error: 'Something went wrong while matching users.' });
  }
};
