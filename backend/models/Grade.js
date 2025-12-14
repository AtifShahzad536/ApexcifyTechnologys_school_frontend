const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    examType: {
        type: String,
        enum: ['Quiz', 'Assignment', 'Mid-term', 'Final', 'Project'],
        required: true
    },
    marks: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    totalMarks: {
        type: Number,
        required: true,
        default: 100
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
        required: true
    },
    remarks: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});



const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade;
