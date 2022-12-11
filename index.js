const express = require('express')
const app = express()
const mongoose = require('mongoose')
const morgan = require('morgan')
const helmet = require('helmet')
const dotenv = require('dotenv')
const userRoute=require('./routes/user')
const postRoute=require('./routes/post')

dotenv.config()

// ***MONGODB CONNECTION***
mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true,useUnifiedTopology:true},()=>{
    console.log('Connected to Database...')
});

//***MIDDLEWARES***
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

//***ERROR HANDLING MIDDLEWARE***
app.use((error,req,res,next) => {
    if(res.headerSent){
        return next(error)
    }
    res.status(error.code || 500).json({message:error.message || 'An unknown error occurred'})
})

app.use('/api/users',userRoute);
app.use('/api/posts',postRoute);

app.listen(5000,() =>{
    console.log("Backend server is running...")
})