const Request = require('../models/Request');
const Notification = require('../models/Notification');

const createRequest = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        let documents = [];

        if (req.files) {
            documents = req.files.map(file => ({
                filename: file.originalname,
                data: file.buffer,
                contentType: file.mimetype
            }));
        }

        const request = await Request.create({
            user: req.user.id,
            title,
            description,
            category,
            documents
        });

        res.status(201).json(request);
    } catch (error) {
        console.error('Create Request Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ user: req.user.id }).select('-documents.data').sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRequestById = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).select('-documents.data').populate('user', 'name email');
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        if (request.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserStats = async (req, res) => {
    try {
        const total = await Request.countDocuments({ user: req.user.id });
        const pending = await Request.countDocuments({ user: req.user.id, status: 'pending' });
        const approved = await Request.countDocuments({ user: req.user.id, status: 'approved' });
        const rejected = await Request.countDocuments({ user: req.user.id, status: 'rejected' });
        res.json({ total, pending, approved, rejected });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getDocument = async (req, res) => {
    try {
        const { requestId, fileId } = req.params;
        const request = await Request.findById(requestId);
        
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Find binary document in sub-array
        const doc = request.documents.find(d => d._id.toString() === fileId);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.set('Content-Type', doc.contentType);
        res.set('Content-Disposition', `inline; filename="${doc.filename}"`);
        res.send(doc.data);
    } catch (error) {
        console.error('Get Document Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateRequest = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        request.title = title || request.title;
        request.description = description || request.description;
        request.category = category || request.category;

        const updatedRequest = await request.save();
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot delete request after it has been processed' });
        }

        await Request.findByIdAndDelete(req.params.id);
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRequest,
    getMyRequests,
    getRequestById,
    getUserStats,
    getDocument,
    updateRequest,
    deleteRequest
};
