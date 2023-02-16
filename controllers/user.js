const HttpError=require('../models/HttpError')
const User=require('../models/User')
const bcrypt=require('bcrypt')


const updateUser=async(req,res,next)=>{
    if(req.body.userId===req.params.id || req.body.isAdmin)//bcz user itself or an Admin can only update or delete user
    {
        let foundUser
        //if user tries to update password then we need to hash new password before storing it to DB 
        if(req.body.password){
            try{
                const salt=await bcrypt.genSalt(12)
                req.body.password=await bcrypt.hash(req.body.password,salt)//updating req.body.password to hasedPassword later we will store whole req.body in DB which now contians hashed password 
            }catch(err){
                return next(new HttpError("Something went wrong!",500))
            }
        }
        //if user is updating anything else rather than password then we will directly store updated thing in DB
        try{
            foundUser =await User.findByIdAndUpdate(req.params.id,{$set:req.body})//$set will update only values present in object passed
        }catch(err){
            return next(new HttpError("Something went wrong!",500))
        }
        res.status(200).json("Account has been updated!")
    }else{
        return next(new HttpError("You are not authorized to update this user!",422))
    }
}

const deleteUser= async (req, res,next) => {
    if(req.body.userId===req.params.id || req.body.isAdmin){
        try{
            await User.findByIdAndDelete(req.params.id)
        }catch(err){
            return next(new HttpError("Something went wrong!",500))
        }
        res.status(200).json("Account has been deleted successfully!")
    }else{
        return next(new HttpError("You are not authorized to delete this user!",422))
    }
}

const getUser=async (req, res, next) => {
    const userId=req.query.userId
    const username=req.query.username
    let foundUser
    try{
        foundUser =userId? await User.findById(userId,'-password'): await User.findOne({username: username},'-password')
    }catch(err){
        return next(new HttpError("Something went wrong!",500))
    }
    if(!foundUser){
        return next(new HttpError("User not found!",404))
    }
    res.status(200).json(foundUser)
}

const getAllUsers = async(req, res,next) =>{
    const allUsers = await User.find({},"-password")
    res.status(200).json(allUsers)
}

const followUser= async (req, res,next) => {
    if(req.body.userId!==req.params.id){//checking if user is not following himself/herself
        try{
            const userToFollow = await User.findById(req.params.id)
            const userWillFollow = await User.findById(req.body.userId)
            if(!userToFollow.followers.includes(req.body.userId))//checking if user does not already follow user
            {
                await userToFollow.updateOne({$push:{followers:req.body.userId}})
                await userWillFollow.updateOne({$push:{followings:req.params.id}})
                await userToFollow.updateOne({$push:{notifications:`${userWillFollow.username} started following you.`}})
                res.status(200).json("User followed successfully!")
            }else{
                return next(new HttpError("You already follow this user",400))
            }
        }catch(err){
            return next(new HttpError("Something went wrong!",500))
        }
    }else{
        return next(new HttpError("You can't follow yourself!",400))
    }
}

const unfollowUser = async (req, res,next)=>{
    if(req.body.userId !==req.params.id){
        try{
            const userToUnfollow=await User.findById(req.params.id)
            const userWillUnfollow=await User.findById(req.body.userId)
            if(userToUnfollow.followers.includes(req.body.userId)){
                await userToUnfollow.updateOne({$pull:{followers:req.body.userId}})
                await userWillUnfollow.updateOne({$pull:{followings:req.params.id}})
                res.status(200).json("User unfollowed successfully")
            }else{
                return next(new HttpError("You don't follow this user",400))
            }
        }catch(err){
            return next(new HttpError("Something went wrong!",500))
        }
    }else{
        return next(new HttpError("You can't unfollow yourself",400))
    }
}

const clearNotifications =async (req,res,next)=>{
    let foundUser
    try{
     foundUser=await User.findById(req.body.userId)
    }catch(e){
        return next(new HttpError("Something went wrong!",500))
    }

    if(foundUser){
        await foundUser.updateOne({$set:{notifications:[]}})
    }else{
        return next(new HttpError("Could not find a user",404))
    }
    res.status(200).json('Popped all notifications')
}


exports.updateUser = updateUser
exports.deleteUser = deleteUser
exports.getUser = getUser
exports.getAllUsers = getAllUsers
exports.followUser = followUser
exports.unfollowUser = unfollowUser
exports.clearNotifications=clearNotifications