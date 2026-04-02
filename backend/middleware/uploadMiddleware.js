const multer = require('multer');

// Use memory storage to store files as buffers before saving to MongoDB
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
});

module.exports = upload;

