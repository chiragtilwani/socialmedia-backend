const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required:true
    },
    creatorId: {
        type: String,
        required: true
    },
    postId: {
        type: String,
        required: true
    },
    likes: {
        type: Array,
        default: []
    },
},
    { timestamps: true }
)

module.exports = mongoose.model('Comment', commentSchema)