const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: { // e.g., "Class 10"
        type: String,
        required: true,
    },
    section: { // e.g., "A"
        type: String,
        required: true,
    },
    teacher: { // Class Teacher
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]
}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);
module.exports = Class;
