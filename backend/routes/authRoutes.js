const express = require('express');
const router = express.Router();
const {
  requestOTP,
  verifyOTP,
  registerUser,
  loginUser,
} = require('../controllers/authController');

router.post('/request-otp', requestOTP);      // Step 1
router.post('/verify-otp', verifyOTP);        // Step 2
router.post('/register', registerUser);       // Step 3
router.post('/login', loginUser);             // Optional

module.exports = router;
