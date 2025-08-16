const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const {
  sendMatchRequest,
  getIncomingRequests,
  getSentRequests,
  respondToRequest
} = require('../controllers/MatchRequestController');
router.use(authenticateUser);

router.post('/', sendMatchRequest);
router.get('/incoming', getIncomingRequests);
router.get('/sent', getSentRequests);
router.put('/:id', respondToRequest);


module.exports = router;
