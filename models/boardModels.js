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
    label: [{
        data: {
            type: String
        },
        color: {
            type: String
        },
        status: {
            type: Boolean,
            default: false
        }
    }],
    color: {
        type: String
    },
    status: {
        type: Boolean,
        default: false
    },
    closeStatus: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('board', boardSchema)   