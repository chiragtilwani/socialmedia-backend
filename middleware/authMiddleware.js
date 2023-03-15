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
            return next(new HttpError("You are not authorized to perform this action", 401))
        }
    }

    if (!token) {
        return next(new HttpError("You are not authorized to perform this action", 401))
    }
}

module.exports = authMiddleware 
