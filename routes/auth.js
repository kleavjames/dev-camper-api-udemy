const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    logout,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

router
    .route('/register')
    .post(register);

router
    .route('/login')
    .post(login);

router
    .route('/me')
    .get(protect, getMe);

router
    .route('/update/me')
    .patch(protect, updateDetails);

router
    .route('/update/me/password')
    .patch(protect, updatePassword);

router
    .route('/logout')
    .get(protect, logout);

router
    .route('/forgotpassword')
    .post(forgotPassword);

router
    .route('/resetpassword/:resettoken')
    .patch(resetPassword);

module.exports = router;