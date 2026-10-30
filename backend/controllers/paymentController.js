
const crypto = require('crypto');
const Razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Contact = require('../models/Contact');

// Add actual fixed package prices when decided.
// Values are in rupees.
const PACKAGE_PRICES = {
  // basic: 2000,
  // standard: 5000,
  // premium: 10000
};
// DEVELOPMENT ONLY — replace with real product prices before launch.
const BOOK_FORMAT_PRICES = {
  soft: 199,
  hard: 499
};
const createOrder = async (req, res, next) => {
  try {
    const { type, packageName, contactId } = req.body || {};

    let amountInRupees;
    let purpose;
    let selectedPackage = '';

    if (type === 'package') {
      if (
        !packageName ||
        !Object.prototype.hasOwnProperty.call(PACKAGE_PRICES, packageName)
      ) {
        return res.status(400).json({
          message: 'Invalid package or package price not configured yet.'
        });
      }

      amountInRupees = PACKAGE_PRICES[packageName];
      purpose = 'Fixed package payment';
      selectedPackage = packageName;

    } else if (type === 'quotation') {
      if (!contactId || !/^[a-fA-F0-9]{24}$/.test(contactId)) {
        return res.status(400).json({
          message: 'A valid contact enquiry ID is required.'
        });
      }

      const contact = await Contact.findById(contactId);

      if (!contact) {
        return res.status(404).json({
          message: 'Contact enquiry not found.'
        });
      }

      if (
        !Number.isSafeInteger(contact.quotedAmount) ||
        contact.quotedAmount < 1
      ) {
        return res.status(400).json({
          message: 'A payment quotation has not been approved yet.'
        });
      }

      amountInRupees = contact.quotedAmount;
      purpose = `Quotation payment for ${contact.fullName}`;

    } else {
      return res.status(400).json({
        message: 'Payment type must be package or quotation.'
      });
    }

    const amount = amountInRupees * 100;

    if (!Number.isSafeInteger(amount) || amount < 100) {
      return res.status(400).json({
        message: 'Invalid payment amount.'
      });
    }

    const receipt = `tb_${Date.now()}`;

    const order = await Razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt,
      notes: {
        purpose,
        type,
        contactId: contactId || '',
        packageName: selectedPackage
      }
    });

    const payment = await Payment.create({
      contactId: contactId || null,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      purpose,
      package: selectedPackage,
      status: 'created',
      receipt
    });

    return res.status(201).json({
      message: 'Razorpay order created successfully.',
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id
    });

  } catch (error) {
    next(error);
  }
};

const createBookOrder = async (req, res, next) => {
  try {
    const { bookTitle, bookFormat } = req.body || {};

    if (
      typeof bookTitle !== 'string' ||
      !bookTitle.trim() ||
      bookTitle.length > 200
    ) {
      return res.status(400).json({
        message: 'A valid book title is required.'
      });
    }

    if (!Object.prototype.hasOwnProperty.call(
      BOOK_FORMAT_PRICES,
      bookFormat
    )) {
      return res.status(400).json({
        message: 'Please select a valid book format.'
      });
    }

    const amount = BOOK_FORMAT_PRICES[bookFormat] * 100;
    const receipt = `book_${Date.now()}`;

    const order = await Razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt,
      notes: {
        purpose: 'Book purchase',
        bookTitle: bookTitle.trim(),
        bookFormat
      }
    });

    const payment = await Payment.create({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      purpose: 'Book purchase',
      bookTitle: bookTitle.trim(),
      bookFormat,
      status: 'created',
      receipt
    });

    return res.status(201).json({
      message: 'Book payment order created.',
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id
    });

  } catch (error) {
    next(error);
  }
};


// Verify Razorpay Checkout payment
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body || {};

    if (
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_signature !== 'string'
    ) {
      return res.status(400).json({
        message: 'Order ID, payment ID and signature are required.'
      });
    }

    // Find the order created by our backend.
    const paymentRecord = await Payment.findOne({
      razorpayOrderId: razorpay_order_id
    });

    if (!paymentRecord) {
      return res.status(404).json({
        message: 'Payment order not found.'
      });
    }

    // Calculate the expected signature using the server-side secret.
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const receivedBuffer = Buffer.from(razorpay_signature, 'hex');

    if (
      !/^[a-fA-F0-9]{64}$/.test(razorpay_signature) ||
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        message: 'Invalid payment signature.'
      });
    }

    // Fetch the payment directly from Razorpay.
    const razorpayPayment = await Razorpay.payments.fetch(
      razorpay_payment_id
    );

    // Ensure this payment belongs to the order we created.
    if (
      razorpayPayment.order_id !== razorpay_order_id ||
      razorpayPayment.amount !== paymentRecord.amount ||
      razorpayPayment.currency !== paymentRecord.currency
    ) {
      return res.status(400).json({
        message: 'Payment details do not match the order.'
      });
    }

    // Only a captured payment is considered paid.
    if (razorpayPayment.status !== 'captured') {
      return res.status(409).json({
        message: `Payment is currently ${razorpayPayment.status}. It has not been marked as paid.`,
        paymentStatus: razorpayPayment.status
      });
    }

    // Prevent a different payment from overwriting an already paid order.
    if (
      paymentRecord.status === 'paid' &&
      paymentRecord.razorpayPaymentId !== razorpay_payment_id
    ) {
      return res.status(409).json({
        message: 'This order has already been paid with another payment.'
      });
    }

    // Save verified payment details.
    paymentRecord.razorpayPaymentId = razorpay_payment_id;
    paymentRecord.signatureVerified = true;
    paymentRecord.status = 'paid';

    await paymentRecord.save();

    return res.status(200).json({
      message: 'Payment verified successfully.',
      paymentStatus: 'paid',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  createBookOrder,
  verifyPayment
};
