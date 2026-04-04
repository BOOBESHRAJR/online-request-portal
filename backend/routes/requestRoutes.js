const express = require('express');
const router = express.Router();
const { createRequest, getMyRequests, getRequestById, getUserStats, getDocument, updateRequest, deleteRequest } = require('../controllers/requestController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
      .post(verifyToken, upload.array('documents', 10), createRequest)
      .get(verifyToken, getMyRequests);

router.get('/stats', verifyToken, getUserStats);
router.route('/:id')
      .get(verifyToken, getRequestById)
      .put(verifyToken, updateRequest)
      .delete(verifyToken, deleteRequest);
router.get('/:requestId/document/:fileId', verifyToken, getDocument);

module.exports = router;
