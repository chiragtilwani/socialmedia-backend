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
    post:{
        public_id:{type:String,default:null},
        url:{type:String,default:null}
    },
    likes:{
        type:Array,
        default:[]
    }
},
{timestamps:true}
)

module.exports =mongoose.model('Post',postSchema)