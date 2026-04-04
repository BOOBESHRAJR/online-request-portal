const Request = require('../models/Request');
const User = require('../models/User');
const Notification = require('../models/Notification');

const getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find({ hiddenFromAdmin: { $ne: true } })
            .select('-documents.data')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const baseQuery = { hiddenFromAdmin: { $ne: true } };
        const total = await Request.countDocuments(baseQuery);
        const pending = await Request.countDocuments({ ...baseQuery, status: 'pending' });
        const approved = await Request.countDocuments({ ...baseQuery, status: 'approved' });
        const rejected = await Request.countDocuments({ ...baseQuery, status: 'rejected' });
        const userCount = await User.countDocuments({ role: 'user' });
        
        // Count by category
        const categoryCounts = await Request.aggregate([
            { $match: baseQuery },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Timeline Trend (Last 7 Days)
        const timelineTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0,0,0,0));
            const endOfDay = new Date(date.setHours(23,59,59,999));
            
            const count = await Request.countDocuments({
                ...baseQuery,
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });
            
            timelineTrend.push({
                date: startOfDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                requests: count
            });
        }

        res.json({ total, pending, approved, rejected, userCount, categoryCounts, timelineTrend });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateRequestStatus = async (req, res) => {
    try {
        const { status, adminReply } = req.body;
        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        request.status = status || request.status;
        if (adminReply) request.adminReply = adminReply;
        const updatedReq = await request.save();

        if (status) {
            await Notification.create({
                user: request.user,
                message: `Your request "${request.title}" status has been updated to ${status}.`
            });
        }

        res.json(updatedReq);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteRequest = async (req, res) => {
    try {
        console.log(`[ADMIN] Soft deleting (hiding) request: ${req.params.id}`);
        // Instead of findByIdAndDelete, we update a hidden flag
        const request = await Request.findByIdAndUpdate(
            req.params.id, 
            { hiddenFromAdmin: true },
            { new: true }
        );
        
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        
        res.json({ message: 'Request removed from admin view' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllRequests,
    getDashboardStats,
    updateRequestStatus,
    getAllUsers,
    deleteRequest,
    deleteUser,
    updateUserRole
};
