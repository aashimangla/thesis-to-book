const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./middleware/authRoutes');
const contactRoutes = require('./middleware/contactRoutes');
const consultationRoutes = require('./middleware/consultationRoutes');
const paymentRoutes = require('./middleware/paymentRoutes');
const app = express();

// Make sure the private upload folder exists
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

app.use(helmet());


const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://127.0.0.1:5500,http://localhost:5500"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as local health checks.
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }

      console.error("Blocked CORS origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

// Body parsers MUST come before API routes
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/consultations', consultationRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (req.file) fs.unlink(req.file.path, () => {});
  let status = err.status || 500;
  if (err.name === 'MulterError') status = 400;
  if (err.name === 'ValidationError') status = 400;
  const message =
    err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 20 MB)' : err.message;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Server error' : message });
});

module.exports = app;
