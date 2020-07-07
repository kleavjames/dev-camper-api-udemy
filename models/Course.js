const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: String,
        required: [true, 'Please add number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: [
            'beginner',
            'intermediate',
            'advanced'
        ]
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
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

// static method to get avg of course tuitions
courseSchema.statics.getAverageCost = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' }
            }
        }
    ]);

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        });
    } catch (error) {
        console.error(error);
    }
}

// call getAverageCost after save
courseSchema.post('save', async function() {
    this.constructor.getAverageCost(this.bootcamp);
});

// call getAverageCost after remove
courseSchema.post('remove', async function() {
    this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', courseSchema);