const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getMe } = require('../controllers/authController');
const { protect, adminOnly } = require('./authMiddleware');
const User = require('../models/User');

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// First user can register openly; afterwards only an admin may add users.
const allowFirstUserOrAdmin = async (req, res, next) => {
  const count = await User.countDocuments();
  if (count === 0) return next();
  protect(req, res, () => adminOnly(req, res, next));
};

router.post('/register', authLimiter, allowFirstUserOrAdmin, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

module.exports = router;
