const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a review title'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add a review text'],
        maxlength: 500
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10']
    },
    bootcamp: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Bootcamp'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true,
    versionKey: false
});

// prevent user from submitting more than one review per bootcamp
reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// static method to get avg ratings
reviewSchema.statics.getAverageRating = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj.length > 0 ? obj[0].averageRating : 0
        });
    } catch (error) {
        console.error(error);
    }
};

// call getAverageRating after save
reviewSchema.post('save', async function() {
    this.constructor.getAverageRating(this.bootcamp);
});

// call getAverageRating after remove
reviewSchema.post('remove', async function() {
    this.constructor.getAverageRating(this.bootcamp);
});


module.exports = mongoose.model('Review', reviewSchema);