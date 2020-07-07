const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../helper/errorResponse');
const User = require('../models/User');

exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    // using bearer token in header
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.header('Authorization').replace('Bearer ', '');
    }
    // using cookie
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }
    
    if (!token) {
        return next(new ErrorResponse(`Not authorize to access this route`, 401));
    };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        req.user = user;

        next();
    } catch (error) {
        return next(new ErrorResponse(`Not authorize to access this route`, 401));
    }
});

// grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`${req.user.role} role is not authorized to access this route`, 403));
        }
        next();
    }
}