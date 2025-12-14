const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    term: {
        type: String,
        enum: ['First Term', 'Mid Term', 'Final Term', 'Annual'],
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    subjects: [{
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        totalMarks: Number,
        obtainedMarks: Number,
        grade: String
    }],
    totalMarks: {
        type: Number,
        required: true
    },
    obtainedMarks: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pass', 'Fail'],
        required: true
    },
    attendance: {
        type: Number,
        min: 0,
        max: 100
    },
    remarks: {
        type: String,
        trim: true
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Calculate overall grade and status before saving
resultSchema.pre('save', function (next) {
    // Calculate percentage
    this.percentage = (this.obtainedMarks / this.totalMarks) * 100;

    // Assign grade
    if (this.percentage >= 90) this.grade = 'A+';
    else if (this.percentage >= 85) this.grade = 'A';
    else if (this.percentage >= 80) this.grade = 'A-';
    else if (this.percentage >= 75) this.grade = 'B+';
    else if (this.percentage >= 70) this.grade = 'B';
    else if (this.percentage >= 65) this.grade = 'B-';
    else if (this.percentage >= 60) this.grade = 'C+';
    else if (this.percentage >= 55) this.grade = 'C';
    else if (this.percentage >= 50) this.grade = 'C-';
    else if (this.percentage >= 40) this.grade = 'D';
    else this.grade = 'F';

    // Determine pass/fail status
    this.status = this.percentage >= 40 ? 'Pass' : 'Fail';

    next();
});

// Ensure one result per student per term per year
resultSchema.index({ student: 1, term: 1, academicYear: 1 }, { unique: true });

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
