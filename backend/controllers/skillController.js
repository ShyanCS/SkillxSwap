const User = require('../models/User');
const Skill = require('../models/Skill');
const UserSkill = require('../models/UserSkill');

exports.addSkill = async (req, res) => {
  try {
    console.log(req.body);
    const { type,name,skillId,description, urgency,proficiencyLevel,desiredProficiency,availability } = req.body;
    const user = await User.findById(req.user._id);
    let skillData = {};
    if(type !== 'offer'){
        skillData = {
        skillId,
        description,
        type,
        urgency,
        desiredProficiency,
        status: "Active",
        }
    }else{
        skillData = {
        skillId,
        description,
        type,
        proficiencyLevel,
        availability,
        status: "Active",
        }
    }
    const userSkill = new UserSkill({ userId: user._id, ...skillData });
    await userSkill.save();
    return res.status(200).json({ 
      message: 'Skill added successfully',
      user: user
    });

  } catch (error) {
    console.error('Error adding skill:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getSkill = async (req, res) => {
  const { type } = req.query;
  const userId = req.user._id; // set by authenticateUser middleware

  try {
    const skills = await UserSkill.find({ userId, type }).populate('skillId').exec();
    const formattedSkill = skills.map(skill => ({
      _id: skill._id,
      type: skill.type,
      description: skill.description,
      status: skill.status,
      createdAt: skill.createdAt,
      name: skill.skillId?.name || null, // pulled from populated skill
      proficiencyLevel: skill.proficiencyLevel,
      desiredProficiency: skill.desiredProficiency,
      urgency: skill.urgency,
      availability: skill.availability
    }))
    return res.json(formattedSkill);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skills', error });
  }
};

exports.deleteSkill = async (req, res) => {
    const userSkillId = req.params.id; // UserSkill document _id
    const userId = req.user._id;

  try {
    const skill = await UserSkill.deleteOne({ _id: userSkillId, userId });
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    return res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    return res.status(500).json({ message: 'Error deleting skill', error });
  }
};

exports.updateSkill = async (req, res) => {
  try {
    const userSkillId = req.params.id; // UserSkill document _id
    const userId = req.user._id;

    const skill = await UserSkill.findOne({ _id: userSkillId, userId });
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    // Check ownership
    if (skill.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this skill' });
    }

    // Extract fields
    const { name, description, urgency, proficiencyLevel, desiredProficiency, availability, status, newSkillId } = req.body;

    // Update skillId if newSkillId is provided
    if (newSkillId) skill.skillId = newSkillId;

    if (name !== undefined) skill.name = name;
    if (description !== undefined) skill.description = description;
    if (status !== undefined) skill.status = status;

    if (skill.type === 'request') {
      if (urgency !== undefined) skill.urgency = urgency;
      if (desiredProficiency !== undefined) skill.desiredProficiency = desiredProficiency;
    } else if (skill.type === 'offer') {
      if (proficiencyLevel !== undefined) skill.proficiencyLevel = proficiencyLevel;
      if (availability !== undefined) skill.availability = availability;
    }

    await skill.save();

    const updatedSkill = await UserSkill.findById(userSkillId);
    return res.status(200).json({ message: 'Skill updated successfully', skill: updatedSkill });

  } catch (error) {
    console.error('Update skill error:', error);
    return res.status(500).json({ message: 'Error updating skill', error: error.message });
  }
};

exports.listSkills = async (req, res) => {
  console.log(req);
  const skills = await Skill.find({});
  console.log(skills);
  res.json(skills);
};