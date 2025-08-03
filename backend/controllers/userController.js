const User = require('../models/User');
const Skill = require('../models/Skill');
const cloudinary = require("cloudinary")

exports.updateProfile = async (req, res) => {
  try {
    const {
      profilePictureUrl,
      bio,
      region,
      timezone,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    // Update user
    user.profilePictureUrl = profilePictureUrl;
    user.bio = bio;
    user.region = region;
    user.timezone = timezone;
    user.updatedAt = new Date();

    await user.save();

    return res.status(200).json({ 
      message: 'Profile updated successfully',
      user: user
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.cloudinarySign = async (req, res) => {
  try {
    // Generate timestamp (signatures are valid for 1 hour)
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Define upload parameters
    const uploadParams = {
      timestamp: timestamp,
      folder: 'profiles', 
    };

    // Generate signature using Cloudinary's api_sign_request method
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    // Return the signature data to frontend
    res.json({
      signature: signature,
      timestamp: timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: uploadParams.folder
    });

  } catch (error) {
    console.error('Error generating signature:', error);
    res.status(500).json({ error: 'Failed to generate upload signature' });
  }
}