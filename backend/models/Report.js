const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Result Card', 'Monthly Performance', 'Term Report'],
        required: true
    },
    month: {
        type: String,
        required: function () { return this.type === 'Monthly Performance'; }
    },
    year: {
        type: Number,
        required: true
    },
    term: {
        type: String,
        enum: ['Mid-term', 'Final', 'Monthly'],
        required: function () { return this.type === 'Result Card'; }
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    // Attendance Summary
    attendance: {
        total: { type: Number, default: 0 },
        present: { type: Number, default: 0 },
        absent: { type: Number, default: 0 },
        late: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
    },
    // Grade Summary
    grades: [{
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        marks: Number,
        totalMarks: Number,
        percentage: Number,
        grade: String
    }],
    overallPercentage: {
        type: Number,
        default: 0
    },
    overallGrade: {
        type: String,
        default: 'N/A'
    },
    // Assignment Summary
    assignments: {
        total: { type: Number, default: 0 },
        submitted: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
        graded: { type: Number, default: 0 }
    },
    // Teacher Comments
    teacherComments: {
        type: String,
        default: ''
    },
    strengths: [{
        type: String
    }],
    areasOfImprovement: [{
        type: String
    }],
    // Status
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    viewedByParent: {
        type: Boolean,
        default: false
    },
    viewedAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
