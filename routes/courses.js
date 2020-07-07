const express = require('express');
const router = express.Router({
    mergeParams: true
});
const Course = require('../models/Course');
const advanceResults = require('../middleware/advanceResults');
const {
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courses');
const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(advanceResults(Course, {
        path: 'bootcamp',
        select: 'name description'
    }), getCourses)
    .post(protect, authorize('publisher', 'admin'), addCourse);

router
    .route('/:id')
    .get(getCourse)
    .patch(protect, authorize('publisher', 'admin'), updateCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
