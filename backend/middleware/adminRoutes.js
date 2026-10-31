const express = require('express');
const router = express.Router();

const {
  protect,
  adminOnly
} = require('./authMiddleware');

const {
  getDashboardStats
} = require('../controllers/adminController');

// All admin routes require an authenticated admin.
router.use(protect, adminOnly);

// GET /api/admin/dashboard
router.get('/dashboard', getDashboardStats);

module.exports = router;