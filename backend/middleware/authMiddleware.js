// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path to your User model

const authenticateUser = async (req, res, next) => {
  console.log(req.cookies)
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user_id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    req.user = user; // Attach user to request
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateUser;
