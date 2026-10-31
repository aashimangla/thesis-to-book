
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const userPayload = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role
});

// POST /api/auth/register
// Public customer registration
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({
        message: 'Name, email and a password of 8+ characters are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'customer'
    });

    res.status(201).json({
      ...userPayload(user),
      token: generateToken(user._id)
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    res.json({
      ...userPayload(user),
      token: generateToken(user._id)
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = (req, res) => {
  res.json(userPayload(req.user));
};
