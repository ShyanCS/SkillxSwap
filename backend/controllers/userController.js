const User = require('../models/User');
const cloudinary = require("cloudinary")

exports.updateProfile = async (req, res) => {
    user = await User.findById(req.user._id);
    console.log(req.body);
    return res.status(200);
}

exports.cloudinarySign = async (req, res) => {
  try {
    // Generate timestamp (signatures are valid for 1 hour)
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Define upload parameters
    const uploadParams = {
      timestamp: timestamp,
      folder: 'profiles', // Optional: organize uploads in folders
      // Add other parameters as needed:
      // transformation: 'w_400,h_400,c_fill',
      // resource_type: 'auto'
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