const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  bio: String,
  region: String,
  timezone: String,
  profilePictureUrl: String,
  karmaPoints: { type: Number, default: 0 },
  skillsOfferedIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  skillsRequestedIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('User', UserSchema);