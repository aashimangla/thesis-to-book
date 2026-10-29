const express = require('express');
const rateLimit = require('express-rate-limit');
const upload = require('../utils/upload');
const { protect, adminOnly } = require('./authMiddleware');
const c = require('../controllers/contactController');

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Too many submissions, please try again later' },
});

// Public: the website form. File field name must be "thesis".
router.post('/', submitLimiter, upload.single('thesis'), c.createContact);

// Admin only
router.use(protect, adminOnly);
router.get('/', c.getContacts);
router.get('/:id', c.getContact);
router.get('/:id/file', c.downloadFile);
router.patch('/:id', c.updateContact);
router.delete('/:id', c.deleteContact);

module.exports = router;
