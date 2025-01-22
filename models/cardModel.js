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
        }
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
    },
    cover: [{
        image:[{
            type: String,
            require: true
        }],
        color: {
            type: String,
        },
        size:{
            type: String,
            // require: true
        }
    }],
    checkList: [
        {
            text: {
                type: String,
                require: true
            },
            completed: {
                type: Boolean,
                default: false
            }
        }
    ]
}, {
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model('card', cardSchema)