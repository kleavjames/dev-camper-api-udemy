const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true,
    versionKey: false,
});

// userSchema.methods.toJSON = function() {
// 	const userObj = this.toObject();
// 	delete userObj.password;

// 	return userObj;
// }

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 8);
    next();
});

// sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// match user entered password to hashed password
userSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password.toString(), this.password);
}

// generate and hash password
userSchema.methods.getResetPasswordToken = function() {
    // generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    // hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

module.exports = mongoose.model('User', userSchema);