const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    month: {
        type: String, // e.g., "October 2023"
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Overdue'],
        default: 'Pending'
    },
    paidAt: {
        type: Date
    },
    type: {
        type: String,
        enum: ['Tuition', 'Transport', 'Exam', 'Other'],
        default: 'Tuition'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Fee', feeSchema);
