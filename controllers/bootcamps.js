const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../helper/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../helper/geocoder');

/**
 * @description Get all bootcamps
 * @route       GET /api/v1/bootcamps
 * @access      Public
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advanceResults);
});

/**
 * @description Get single bootcamp
 * @route       GET /api/v1/bootcamps/:id
 * @access      Public
 */
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: bootcamp
    });
});

/**
 * @description Create new bootcamp
 * @route       POST /api/v1/bootcamps
 * @access      Private
 */
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // add user
    req.body.user = req.user.id;

    // check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
    // if user is not admin, can only add 1 bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ID ${req.user.id} has already published a bootcamp`, 401));
    }

    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        data: bootcamp
    });
});

/**
 * @description Update bootcamp
 * @route       PATCH /api/v1/bootcamps/:id
 * @access      Private
 */
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404));
    }

    // make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ID ${req.params.id} is not authorized to update this bootcamp`, 401));
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: bootcamp
    });
});

/**
 * @description Delete bootcamp
 * @route       DELETE /api/v1/bootcamps/:id
 * @access      Private
 */
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404));
    }

    // make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ID ${req.params.id} is not authorized to remove this bootcamp`, 401));
    }

    await bootcamp.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

/**
 * @description GET bootcamp within a radius
 * @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
 * @access      Private
 */
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;
    
    // get lat/lang from DB
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;
    // calculate radius using radians
    // divide distance by radius of Earth
    // Earth radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [ [ lng, lat ], radius ]
            }
        }
    });

    res.status(200).json({
        success: true,
        cout: bootcamps.length,
        data: bootcamps
    });
});

/**
 * @description Upload photo for bootcamp
 * @route       PATCH /api/v1/bootcamps/:id/photo
 * @access      Private
 */
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404));
    }

    // make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ID ${req.params.id} is not authorized to update this bootcamp`, 401));
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;
    // check if file is an image
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`File must be an image`, 400));
    }
    // check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`File must be less than 2mb`, 400));
    }
    // create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Unable to upload the image`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name }, {
            new: true,
            runValidators: true
        });
    })

    res.status(200).json({
        success: true,
        data: file.name
    });
});