const Message = require('../models/Message');
const Request = require('../models/Request');

const sendMessage = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { message } = req.body;
        
        const request = await Request.findById(requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        let attachment = null;
        if (req.file) {
            attachment = {
                filename: req.file.originalname,
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        const newMessage = await Message.create({
            request: requestId,
            sender: req.user.id,
            message,
            attachment
        });

        const fullMessage = await Message.findById(newMessage._id).populate('sender', 'name role');
        res.status(201).json(fullMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMessagesByRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const messages = await Message.find({ request: requestId })
            .select('-attachment.data')
            .populate('sender', 'name role')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMessageAttachment = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findById(messageId);
        
        if (!message || !message.attachment || !message.attachment.data) {
            return res.status(404).json({ message: 'Attachment not found' });
        }

        res.set('Content-Type', message.attachment.contentType);
        res.set('Content-Disposition', `inline; filename="${message.attachment.filename}"`);
        res.send(message.attachment.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    getMessagesByRequest,
    getMessageAttachment
};
