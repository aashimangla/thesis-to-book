
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      default: null
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true
    },

    razorpayPaymentId: {
      type: String,
      default: null
    },

    amount: {
      type: Number,
      required: true
    },

    currency: {
      type: String,
      default: 'INR'
    },

    purpose: {
      type: String,
      required: true
    },

    package: {
      type: String,
      default: ''
    },

    bookTitle: {
      type: String,
      default: ''
    },

    bookFormat: {
      type: String,
      enum: ['', 'soft', 'hard'],
      default: ''
    },

    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created'
    },

    signatureVerified: {
      type: Boolean,
      default: false
    },

    receipt: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
