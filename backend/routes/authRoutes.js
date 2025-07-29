const express = require('express');
const authenticateUser = require('../middleware/authMiddleware');
const router = express.Router();
const {
  requestOTP,
  verifyOTP,
  registerUser,
  loginUser,
  resetPass,
} = require('../controllers/authController');
const {
  updateProfile,
  cloudinarySign,
} = require('../controllers/userController');
const {
  addSkill,
  getSkill,
  deleteSkill,
  updateSkill,
} = require('../controllers/skillController');

router.post('/request-otp', requestOTP);      
router.post('/verify-otp', verifyOTP);        
router.post('/register', registerUser);       
router.post('/login', loginUser);             
router.post('/reset', resetPass);       
router.get('/cloudinary-sign',authenticateUser, cloudinarySign);       
router.get('/me', authenticateUser, (req, res) => {
  res.status(200).json({ user: req.user });
});
router.put('/update-profile', authenticateUser, updateProfile);
router.post('/add-skill', authenticateUser, addSkill);
router.get('/get-skill', authenticateUser, getSkill);
router.delete('/skills/:id', authenticateUser, deleteSkill);
router.put('/skills/:id', authenticateUser, updateSkill);
module.exports = router;
