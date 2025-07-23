const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['offer', 'request'], required: true },
  proficiencyLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] }, // for offered
  desiredProficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] }, // for requested
  urgency: { type: String, enum: ['Low', 'Medium', 'High'] }, // for requested
  availability: [String], // for offered
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Skill', SkillSchema);
