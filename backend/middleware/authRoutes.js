
const express = require('express');
const rateLimit = require('express-rate-limit');

const {
  register,
  login,
  getMe
} = require('../controllers/authController');

const { protect } = require('./authMiddleware');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    message: 'Too many requests. Please try again later.'
  }
});

// Public customer registration
router.post('/register', authLimiter, register);

// Login for both admins and customers
router.post('/login', authLimiter, login);

// Get currently authenticated user's details
router.get('/me', protect, getMe);

module.exports = router;
