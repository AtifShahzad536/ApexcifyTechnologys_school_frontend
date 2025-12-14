const mongoose = require('mongoose');

const examSubmissionSchema = new mongoose.Schema({
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId }, // Optional reference if needed
        selectedOption: { type: Number, required: true }
    }],
    score: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Submitted', 'Graded'],
        default: 'Submitted'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ExamSubmission', examSubmissionSchema);
