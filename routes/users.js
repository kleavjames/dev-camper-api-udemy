const express = require('express');
const router = express.Router();
const User = require('../models/User');
const advanceResults = require('../middleware/advanceResults');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

router
    .use(protect)
    .use(authorize('admin'));

router
    .route('/')
    .get(advanceResults(User), getUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;
