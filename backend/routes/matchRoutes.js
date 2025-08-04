const express = require('express');
const router = express.Router();
const { matches } = require('../controllers/matchController');
const authenticateUser = require('../middleware/authMiddleware');

// All skill routes require authentication
router.use(authenticateUser);

// Skill routes
router.get('/matches',matches);

module.exports = router; 