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

router.post('/request-otp', requestOTP);      
router.post('/verify-otp', verifyOTP);        
router.post('/register', registerUser);       
router.post('/login', loginUser);             
router.post('/reset', resetPass);       
router.get('/me', authenticateUser, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
