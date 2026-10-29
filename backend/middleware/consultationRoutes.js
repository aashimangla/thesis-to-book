const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect, adminOnly } = require('./authMiddleware');
const c = require('../controllers/consultationController');

const router = express.Router();

const submitLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });

router.post('/', submitLimiter, c.createConsultation);

router.use(protect, adminOnly);
router.get('/', c.getConsultations);
router.patch('/:id', c.updateConsultation);
router.delete('/:id', c.deleteConsultation);

module.exports = router;
