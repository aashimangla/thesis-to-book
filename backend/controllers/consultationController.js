const Consultation = require('../models/Consultation');
const sendEmail = require('../utils/sendEmail');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

// POST /api/consultations (public)
exports.createConsultation = async (req, res, next) => {
  try {
    const { name, email, phone, preferredDate, preferredTime, topic, message, website } = req.body;
    if (website) return res.status(201).json({ message: 'Consultation requested' }); // honeypot
    if (!name || !email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'A name and valid email are required' });
    }
    const consultation = await Consultation.create({
      name, email, phone, preferredTime, topic, message,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
    });

    sendEmail({
      to: process.env.ADMIN_NOTIFY_EMAIL,
      subject: `New consultation request from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\nPreferred: ${preferredDate || '-'} ${preferredTime || ''}\nTopic: ${topic || '-'}\n\n${message || ''}`,
    });
    sendEmail({
      to: email,
      subject: 'Consultation request received - ThesisToBook',
      text: `Hello ${name},\n\nWe have received your consultation request and will confirm a time shortly.\n\nThesisToBook`,
    });

    res.status(201).json({ message: 'Consultation requested', id: consultation._id });
  } catch (err) {
    next(err);
  }
};

// GET /api/consultations (admin)
exports.getConsultations = async (req, res, next) => {
  try {
    const filter = STATUSES.includes(req.query.status) ? { status: req.query.status } : {};
    const items = await Consultation.find(filter).sort('-createdAt').limit(200);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/consultations/:id (admin)
exports.updateConsultation = async (req, res, next) => {
  try {
    const update = {};
    if (req.body.status) {
      if (!STATUSES.includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' });
      update.status = req.body.status;
    }
    if (typeof req.body.adminNotes === 'string') update.adminNotes = req.body.adminNotes;
    const item = await Consultation.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ message: 'Consultation not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/consultations/:id (admin)
exports.deleteConsultation = async (req, res, next) => {
  try {
    const item = await Consultation.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Consultation not found' });
    res.json({ message: 'Consultation deleted' });
  } catch (err) {
    next(err);
  }
};
