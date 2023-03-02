const User = require('../models/User')
const bcrypt = require('bcrypt')
const HttpError=require('../models/HttpError')
const jwt =require('jsonwebtoken')

require("dotenv").config();
const register = async (req, res,next) => {
    const { name,username, email, password } = req.body
    if(username.includes(" ")){
        return next(new HttpError('Username must not contain any white spaces'))
    }
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
    res.status(201).json({
        _id:newUser._id,
        email:newUser.email,
        name:newUser.name,
        username:newUser.username,
        token:getToken(newUser._id)
    })
}

const login = async (req, res,next) => {
    const {username_email,password} = req.body
    
    let foundUser;
    try{
        foundUser = await User.findOne({$or:[{username:username_email},{email:username_email}]})
    }catch(err){
        return next(new HttpError("Could not login.Something went wrong",500))
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

    res.status(200).json({
        _id:foundUser._id,
        email:foundUser.email,
        name:foundUser.name,
        username:foundUser.username,
        token:getToken(foundUser._id)
    })
}
const getToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'7d'})
}

exports.register = register
exports.login = login