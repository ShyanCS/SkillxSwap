const mongoose = require('mongoose');

const MatchRequestSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillsOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSkill' }],
  skillsRequested: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSkill' }],
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MatchRequest', MatchRequestSchema);
