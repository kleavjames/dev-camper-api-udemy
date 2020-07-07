const ErrorResponse = require('../helper/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

/**
 * @description Get all users
 * @route       GET /api/v1/users
 * @access      Private - Admin
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advanceResults)
});

/**
 * @description Get single user
 * @route       GET /api/v1/users/:id
 * @access      Private - Admin
 */
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User not found`, 404));
    }

    res.status(200).json({
        success: true,
        data: user
    })
});

/**
 * @description Create new user
 * @route       POST /api/v1/users
 * @access      Private - Admin
 */
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user
    });
});

/**
 * @description Update user
 * @route       PATCH /api/v1/users/:id
 * @access      Private - Admin
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

/**
 * @description Delete user
 * @route       PATCH /api/v1/users/:id
 * @access      Private - Admin
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        data: 'User is deleted'
    });
});