const User = require('../models/User');
const Skill = require('../models/Skill');

exports.addSkill = async (req, res) => {
  try {
    console.log(req.body);
    const { type,name, description, urgency,proficiencyLevel,desiredProficiency,availability } = req.body;
    const user = await User.findById(req.user._id);
    let skillsOfferedIds = user.skillsOfferedIds;
    let skillsRequestedIds = user.skillsRequestedIds;
    let skillData = {};
    if(type !== 'offer'){
        skillData = {
        name,
        description,
        type,
        urgency,
        desiredProficiency,
        status: "Active",
        }
    }else{
        skillData = {
        name,
        description,
        type,
        proficiencyLevel,
        availability,
        status: "Active",
        }
    }
    const skill = new Skill({ userId: user._id, ...skillData });
    const savedSkill = await skill.save();
    if(type !== 'offer'){
        skillsRequestedIds.push(savedSkill._id);
        user.skillsRequestedIds = skillsRequestedIds;
    }else{
        skillsOfferedIds.push(savedSkill._id);
        user.skillsOfferedIds = skillsOfferedIds;
    }
    await user.save();
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
    const skills = await Skill.find({ userId, type });
    return res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skills', error });
  }
};

exports.deleteSkill = async (req, res) => {
  const skillId = req.params.id;
  const userId = req.user._id;

  try {
    const skill = await Skill.findByIdAndDelete(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (skill.type === "offer") {
      user.skillsOfferedIds = user.skillsOfferedIds.filter(id => id.toString() !== skillId);
    } else {
      user.skillsRequestedIds = user.skillsRequestedIds.filter(id => id.toString() !== skillId);
    }

    await user.save();

    return res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    return res.status(500).json({ message: 'Error deleting skill', error });
  }
};
