const mongoose = require('mongoose')

const boardSchema = mongoose.Schema({
    workSpaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'workspace',
        require: true
    },
    title: {
        type: String,
        require: true
    },
    visibility: {
        type: String,
        enum: ['private', 'workspace', 'public'],
        default: 'public'
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'admin'
        }
    }],
    invitationLink: {
        type: String
    },
    color: {
        type: String
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('board', boardSchema)