const express = require('express')
const app = express()
const mongoose = require('mongoose')
const morgan = require('morgan')
const helmet = require('helmet')
const dotenv = require('dotenv')
const userRoute=require('./routes/user')
const postRoute=require('./routes/post')
const commentRoute=require('./routes/comment')

dotenv.config()

// ***MONGODB CONNECTION***
mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true,useUnifiedTopology:true},()=>{
    console.log('Connected to Database...')
});

//***MIDDLEWARES***
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

//adding headers to all responses
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-with,Content-Type,Accept,Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE')

    next()
})

app.use('/api/users',userRoute);
app.use('/api/posts',postRoute);
app.use('/api/comments',commentRoute);

//***HANDLING ERROR FOR ROUTE NOT FOUND***
app.use((req, res, next) => {
    const error = new HttpError("could not find this route", 404)
    return next(error)
})

//***ERROR HANDLING MIDDLEWARE***
app.use((error,req,res,next) => {
    if(res.headerSent){
        return next(error)
    }
    res.status(error.code || 500).json({message:error.message || 'An unknown error occurred'})
})

app.listen(process.env.PORT || 5000,() =>{
    console.log("Backend server is running...")
})
