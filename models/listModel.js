const mongoose = require('mongoose')

const listScheam = mongoose.Schema({
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'board',
        require: true
    },
    title: {
        type: String,
        require: true
    },
    position: {
        type: Number,
        required: true
    },
    archived: {
        type: Boolean,
        default: false
    },
    color:{
        type: String
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('list', listScheam)