const nodemailer = require('nodemailer');

let transporter;
const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

// Never throws: a failed email must not fail the enquiry itself.
const sendEmail = async ({ to, subject, text }) => {
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

module.exports = sendEmail;
