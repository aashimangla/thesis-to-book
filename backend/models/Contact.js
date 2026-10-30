const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    // 01. Your details
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    institution: { type: String, trim: true },
    qualification: { type: String, trim: true },

    // 02. Manuscript
    documentType: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    bookTitle: { type: String, trim: true },
    wordCount: { type: String, trim: true },
    manuscriptStatus: { type: String, required: true, trim: true },
    publishingGoal: { type: String, required: true, trim: true },

    // 03. Services
    services: [{ type: String, trim: true }],
    package: {
      type: String,
      enum: ['', 'basic', 'standard', 'premium', 'publishing-assistance'],
      default: '',
    },
    budget: { type: String, trim: true },
    timeline: { type: String, trim: true },

    // 04. Upload (stored privately on the server, never publicly served)
    file: {
      originalName: String,
      storedName: String,
      path: String,
      size: Number,
      mimetype: String,
    },

    // 05. Additional
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    heardAbout: { type: String, trim: true },
    consent: { type: Boolean, required: true },

    // Admin workflow
    status: {
      type: String,
      enum: ['new', 'assessed', 'quoted', 'in-progress', 'delivered', 'closed'],
      default: 'new',
    },
    adminNotes: { type: String, default: '' },
    quotedAmount: {
  type: Number,
  min: 1,
  default: null
},
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
