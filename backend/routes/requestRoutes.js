const express = require('express');
const router = express.Router();
const { createRequest, getMyRequests, getRequestById, getUserStats, getDocument } = require('../controllers/requestController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
      .post(verifyToken, upload.array('documents', 5), createRequest)
      .get(verifyToken, getMyRequests);

router.get('/stats', verifyToken, getUserStats);
router.get('/:id', verifyToken, getRequestById);
router.get('/:requestId/document/:fileId', verifyToken, getDocument);

module.exports = router;
