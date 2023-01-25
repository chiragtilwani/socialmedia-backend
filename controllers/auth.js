const User = require('../models/User')
const bcrypt = require('bcrypt')
const HttpError=require('../models/HttpError')

const register = async (req, res,next) => {
    const { name,username, email, password } = req.body
    //checking if email and username already exist
    let foundUser 
    try{
        foundUser = await User.findOne({$or:[{username:username},{email:email}]},"-password")
    }catch(err){
        return next(new HttpError('Could not register,something went wrong',500))
    }
    
    if(foundUser){
        return next (new HttpError('Could not register,email or username already exist!',400))
    }

    //encoding password
    let hashedPassword
    try{
        const salt=await bcrypt.genSalt(12);
        hashedPassword = await bcrypt.hash(password,salt)
    }catch(err){
        return next (new HttpError('Could not register,something went wrong',500))
    }

    //create new user
    let newUser = new User({name,username,email,password:hashedPassword})
    try{
        await newUser.save()
    }catch(err){
        return next(new HttpError('Could not register,something went wrong!',500))
    }
    //returning response
    res.status(201).json(newUser)
}

const login = async (req, res,next) => {
    const {username_email,password} = req.body
    
    let foundUser;
    try{
        foundUser = await User.findOne({$or:[{username:username_email},{email:username_email}]})
    }catch(err){
        return next(new HttpError("Could not login.something went wrong",500))
    }
    if(!foundUser){
        return next(new HttpError("Credentials seems to be wrong!",400))
    }
    
    let isValidPassword
    try{
        isValidPassword =await bcrypt.compare(password,foundUser.password)
    }catch(err){
        return next(new HttpError("Could not login.something went wrong",500))
    }
    
    if(!isValidPassword){
        return next(new HttpError("Credentials seems to be wrong!",400))
    }
    
    res.status(200).json(foundUser)
}

exports.register = register
exports.login = login