const mongoose = require('mongoose');

const requestSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    documents: [{
        filename: { type: String, required: true },
        data: { type: Buffer, required: true },
        contentType: { type: String, required: true }
    }],
    adminReply: {
        type: String
    },
    hiddenFromAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
