const express = require('express');
const router = express.Router();
const { 
    getAllRequests, 
    getDashboardStats, 
    updateRequestStatus, 
    getAllUsers, 
    deleteRequest,
    deleteUser,
    updateUserRole
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken, isAdmin);

router.get('/requests', getAllRequests);
router.get('/stats', getDashboardStats);
router.put('/requests/:id', updateRequestStatus);
router.delete('/request/:id', deleteRequest);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUserRole);

module.exports = router;
