const express = require('express');
const router = express.Router();
const { addSkill, getSkill, deleteSkill, updateSkill } = require('../controllers/skillController');
const authenticateUser = require('../middleware/authMiddleware');

// All skill routes require authentication
router.use(authenticateUser);

// Skill routes
router.post('/add', addSkill);
router.get('/get', getSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

module.exports = router; 