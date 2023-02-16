const jwt = require('jsonwebtoken')
const User = require('../models/User')
const HttpError = require('../models/HttpError')

const authMiddleware = async (req, res, next) => {
    let token

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password')

            next()
        } catch (error) {
            //   console.log(error)
            //   res.status(401)
            //   throw new Error('Not authorized')
            return next(new HttpError("Not authorized", 401))
        }
    }

    if (!token) {
        // res.status(401)
        // throw new Error('Not authorized, no token')
        return next(new HttpError("Not authorized", 401))
    }
}

module.exports = authMiddleware 