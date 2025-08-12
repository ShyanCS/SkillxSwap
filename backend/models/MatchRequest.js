const mongoose = require('mongoose');

const SkillInfoSchema = new mongoose.Schema({
  userSkillId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSkill' },
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
  skillName: String
}, { _id: false });

const MatchRequestSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillsOffered: [SkillInfoSchema],
  skillsRequested: [SkillInfoSchema],
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MatchRequest', MatchRequestSchema);
