const express = require('express');
const router = express.Router();
const  protect  = require('../middleware/authMiddleware');
const authenticateUser = require('../middleware/authMiddleware');
const {
  sendMatchRequest,
  getIncomingRequests,
  getSentRequests,
  respondToRequest
} = require('../controllers/MatchRequestController');

router.use(protect);

router.post('/', sendMatchRequest);
router.get('/incoming', getIncomingRequests);
router.get('/sent', getSentRequests);
router.put('/:id', respondToRequest);
router.use(authenticateUser);


module.exports = router;
