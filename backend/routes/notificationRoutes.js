const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.route('/').get(verifyToken, getMyNotifications);
router.route('/:id/read').put(verifyToken, markAsRead);

module.exports = router;
