const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Admin', 'Teacher', 'Student', 'Parent'],
        required: false  // Optional initially, assigned by admin
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    // Common fields
    phone: String,
    address: String,

    // Student specific
    studentClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
    },
    rollNumber: String,
    parent: { // Link student to parent
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    // Parent specific
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    // Teacher specific
    qualification: String,
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password and __v from JSON responses
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
};

const User = mongoose.model('User', userSchema, 'schooluser');
module.exports = User;
