const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
        unique: true
    },
    days: [{
        day: {
            type: String, // Monday, Tuesday, etc.
            required: true
        },
        periods: [{
            subject: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subject',
                required: true
            },
            teacher: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            startTime: {
                type: String, // e.g. "09:00"
                required: true
            },
            endTime: {
                type: String, // e.g. "09:45"
                required: true
            },
            isOnline: {
                type: Boolean,
                default: false
            }
        }]
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Timetable', timetableSchema);
