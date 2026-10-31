
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } =
      process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !MONGO_URI) {
      throw new Error(
        'ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD and MONGO_URI must be configured.'
      );
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error('Admin password must be at least 12 characters.');
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const email = ADMIN_EMAIL.toLowerCase().trim();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }

    const admin = await User.create({
      name: ADMIN_NAME,
      email,
      password: ADMIN_PASSWORD,
      role: 'admin'
    });

    console.log('Company admin created successfully.');
    console.log('Admin ID:', admin._id.toString());
    console.log('Admin email:', admin.email);
  } catch (error) {
    console.error('Admin creation failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
