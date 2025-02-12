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
    archived: {
        type: Boolean,
        default: false
    },
    color: {
        type: String
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
    },
    position: {
        type: Number,
        require: true
    },
    label: [{
        labelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'board',
        },
    }],
    attachments: [{
        url: {
            type: String,
            require: true
        },
        image: [{
            type: String,
            require: true
        }],
        status: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
        }
    }],
    member: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    }],
    customFields: [{
        fieldId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'customfield'
        },
        selectedOptions: [{
            type: mongoose.Schema.Types.ObjectId
        }]
    }],
    cover: [{
        image: [{
            type: String,
            require: true
        }],
        color: {
            type: String,
        },
        size: {
            type: String,
            // require: true
        }
    }],
    checkList: [{
        title: String,
        list: [{
            text: {
                type: String,
                required: true
            },
            completed: {
                type: Boolean,
                default: false
            }
        }]
    }],
    currentTime: {
        type: String
    }
}, {
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model('card', cardSchema)