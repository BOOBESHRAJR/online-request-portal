const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUserProfile, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateUserProfile);
router.post('/change-password', verifyToken, changePassword);

module.exports = router;
