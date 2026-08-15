const mongoose = require('mongoose');
const MatchSchema = new mongoose.Schema({
  user1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillsExchanged: [
    {
      offeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }
    }
  ],
  compatibilityScore: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', MatchSchema);