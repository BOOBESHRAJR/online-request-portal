const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware'); 
const { sendMessage, getMessagesByRequest, getMessageAttachment } = require('../controllers/messageController');
const upload = require('../middleware/uploadMiddleware');

router.route('/:requestId')
      .get(verifyToken, getMessagesByRequest)
      .post(verifyToken, upload.single('attachment'), sendMessage);

router.get('/attachment/:messageId', verifyToken, getMessageAttachment);

module.exports = router;
