const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        required: true
    },
    attachments: [{
        filename: String,
        url: String
    }],
    grade: {
        type: Number,
        min: 0
    },
    feedback: {
        type: String
    },
    status: {
        type: String,
        enum: ['Submitted', 'Graded', 'Late', 'Resubmit'],
        default: 'Submitted'
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gradedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Ensure one submission per student per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
