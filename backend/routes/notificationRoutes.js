const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.route('/').get(verifyToken, getMyNotifications);
router.route('/mark-all-read').put(verifyToken, markAllAsRead);
router.route('/:id/read').put(verifyToken, markAsRead);

module.exports = router;
