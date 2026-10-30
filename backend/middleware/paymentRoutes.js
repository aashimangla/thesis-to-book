
const express = require('express');
const rateLimit = require('express-rate-limit');

const {
  createOrder,
  createBookOrder,
  verifyPayment
} = require('../controllers/paymentController');

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: 'Too many payment requests. Please try again later.'
  }
});

// General service and quotation payments
router.post('/create-order', paymentLimiter, createOrder);

// Book purchases
router.post('/create-book-order', paymentLimiter, createBookOrder);

// Payment verification
router.post('/verify', paymentLimiter, verifyPayment);

module.exports = router;
