const mongoose = require('mongoose')

const workSpaceSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    shortName: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
        }
    }],
    visibility: {
        type: String,
        enum: ['private', 'public'],
        default: 'public'
    },
    inviteLink: {
        type: String
    },
    premium: {
        type: String,
        default: "free"
    },
    premiumType: {
        type: String,
        enum: ["Monthly", "Annually"],
    },
    premiumEndDate: {
        type: String,
        require: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('workspace', workSpaceSchema);