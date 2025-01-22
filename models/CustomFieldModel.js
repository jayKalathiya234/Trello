const mongoose = require('mongoose')

const customFieldSchema = mongoose.Schema({
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'board',
        require: true
    },
    field: [
        {
            fieldLabel: {
                type: String,
                required: true
            },
            fieldType:{
                type:String
            },
            fieldShown:{
                type: Boolean,
                default: true
            },
            fieldOptions: [
                {
                    color: {
                        type: String,
                        required: true
                    },
                    text: {
                        type: String,
                        required: true
                    }
                }
            ]
        }
    ]


}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('customfield', customFieldSchema)   