const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const ALLOWED = {
  '.pdf': ['application/pdf'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 1 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED[ext] || !ALLOWED[ext].includes(file.mimetype)) {
      const err = new Error('Only PDF or DOCX files are allowed');
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

module.exports = upload;
