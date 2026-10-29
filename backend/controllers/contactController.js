const fs = require('fs');
const path = require('path');
const Contact = require('../models/Contact');
const sendEmail = require('../utils/sendEmail');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PACKAGES = ['basic', 'standard', 'premium', 'publishing-assistance'];
const STATUSES = ['new', 'assessed', 'quoted', 'in-progress', 'delivered', 'closed'];

const removeFile = (file) => file && fs.unlink(file.path, () => {});

// POST /api/contact  (multipart/form-data, public)
exports.createContact = async (req, res, next) => {
  try {
    const b = req.body;

    // Honeypot: bots fill hidden "website" field. Pretend success.
    if (b.website) {
      removeFile(req.file);
      return res.status(201).json({ message: 'Enquiry received' });
    }

    const required = ['fullName', 'email', 'phone', 'country', 'documentType', 'subject', 'manuscriptStatus', 'publishingGoal', 'message'];
    const missing = required.filter((f) => !b[f] || !String(b[f]).trim());
    const consent = b.consent === true || b.consent === 'true' || b.consent === 'on';
    if (missing.length || !consent) {
      removeFile(req.file);
      return res.status(400).json({
        message: 'Please complete all required fields and confirm consent',
        missing: consent ? missing : [...missing, 'consent'],
      });
    }
    if (!EMAIL_RE.test(b.email)) {
      removeFile(req.file);
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // services may arrive as one value, repeated values, or services[]
    let services = b.services || b['services[]'] || [];
    if (!Array.isArray(services)) services = [services];

    const contact = await Contact.create({
      fullName: b.fullName,
      email: b.email,
      phone: b.phone,
      country: b.country,
      institution: b.institution,
      qualification: b.qualification,
      documentType: b.documentType,
      subject: b.subject,
      bookTitle: b.bookTitle,
      wordCount: b.wordCount,
      manuscriptStatus: b.manuscriptStatus,
      publishingGoal: b.publishingGoal,
      services,
      package: PACKAGES.includes(b.package) ? b.package : '',
      budget: b.budget,
      timeline: b.timeline,
      message: b.message,
      heardAbout: b.heardAbout,
      consent: true,
      file: req.file
        ? {
            originalName: req.file.originalname,
            storedName: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
          }
        : undefined,
    });

    // Fire-and-forget emails
    sendEmail({
      to: process.env.ADMIN_NOTIFY_EMAIL,
      subject: `New thesis enquiry from ${contact.fullName}`,
      text: `Name: ${contact.fullName}\nEmail: ${contact.email}\nPhone: ${contact.phone}\nPackage: ${contact.package || '-'}\nField: ${contact.subject}\nFile: ${contact.file ? contact.file.originalName : 'none'}\n\n${contact.message}`,
    });
    sendEmail({
      to: contact.email,
      subject: 'We have received your enquiry - ThesisToBook',
      text: `Hello ${contact.fullName},\n\nThank you for your enquiry. Our team will review your manuscript details and get back to you soon.\n\nThesisToBook`,
    });

    res.status(201).json({ message: 'Enquiry received', id: contact._id });
  } catch (err) {
    removeFile(req.file);
    next(err);
  }
};

// GET /api/contact?status=&page=&limit=&search=   (admin)
exports.getContacts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const filter = {};
    if (STATUSES.includes(req.query.status)) filter.status = req.query.status;
    if (req.query.search) {
      const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ fullName: rx }, { email: rx }, { subject: rx }];
    }
    const [items, total] = await Promise.all([
      Contact.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).select('-file.path'),
      Contact.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/contact/:id   (admin)
exports.getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id).select('-file.path');
    if (!contact) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(contact);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/contact/:id   (admin) - update status / notes
exports.updateContact = async (req, res, next) => {
  try {
    const update = {};
    if (req.body.status) {
      if (!STATUSES.includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' });
      update.status = req.body.status;
    }
    if (typeof req.body.adminNotes === 'string') update.adminNotes = req.body.adminNotes;
    const contact = await Contact.findByIdAndUpdate(req.params.id, update, { new: true }).select('-file.path');
    if (!contact) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(contact);
  } catch (err) {
    next(err);
  }
};

// GET /api/contact/:id/file   (admin) - download manuscript
exports.downloadFile = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact || !contact.file || !contact.file.path) {
      return res.status(404).json({ message: 'No file for this enquiry' });
    }
    // path.basename guards against any path tampering
    const safePath = path.join(__dirname, '..', 'uploads', path.basename(contact.file.path));
    if (!fs.existsSync(safePath)) return res.status(404).json({ message: 'File missing on server' });
    res.download(safePath, contact.file.originalName);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/contact/:id   (admin)
exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Enquiry not found' });
    if (contact.file && contact.file.path) {
      fs.unlink(path.join(__dirname, '..', 'uploads', path.basename(contact.file.path)), () => {});
    }
    res.json({ message: 'Enquiry deleted' });
  } catch (err) {
    next(err);
  }
};
