const express = require('express');
const router = express.Router();
// include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');
const Bootcamp = require('../models/Bootcamp');
const advanceResults = require('../middleware/advanceResults');
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps');
const { protect, authorize } = require('../middleware/auth');

// reroute into other resouce routers
router
    .use('/:bootcampId/courses', courseRouter)
    .use('/:bootcampId/reviews', reviewRouter);

router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

router
    .route('/:id/photo')
    .patch(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
    .route('/')
    .get(advanceResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .patch(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
