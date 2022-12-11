const mongoose=require('mongoose')


const postSchema = new mongoose.Schema({
    creatorId:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        max:500
    },
    postImg:{
        public_id:String,
        url:String
    },
    likes:{
        type:Array,
        default:[]
    }
},
{timestamps:true}
)

module.exports =mongoose.model('Post',postSchema)