const mongoose = require('mongoose');

// A request to book a call/consultation. Adjust fields to match your form.
const consultationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    preferredDate: { type: Date },
    preferredTime: { type: String, trim: true },
    topic: { type: String, trim: true },
    message: { type: String, trim: true, maxlength: 3000 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);
