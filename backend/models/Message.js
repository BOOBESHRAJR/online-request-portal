const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    request: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Request'
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    message: {
        type: String
    },
    attachments: [{
        filename: { type: String },
        data: { type: Buffer },
        contentType: { type: String }
    }]
}, {
    timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
