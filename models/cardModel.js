const mongoose = require('mongoose')

const cardSchema = mongoose.Schema({
    listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'list',
        require: true
    },
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    startDate: {
        type: String,
        require: true
    },
    dueDate: {
        type: String,
        require: true
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'done'],
        default: 'todo'
    },
    position: {
        type: Number,
        require: true
    },
    label: [{
        data: {
            type: String
        }
    }],
    attachments: [{
        url: {
            type: String,
            require: true
        },
        image: [{
            type: String,
            require: true
        }]
    }],
    member: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    }],
    customFields: {
        type: mongoose.Schema.Types.Mixed,
        require: true
    }
}, {
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model('card', cardSchema)