const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    updateTimetable,
    getTimetable,
    createEvent,
    getEvents,
    deleteEvent
} = require('../controllers/calendarController');

// Timetable Routes
router.route('/timetable')
    .post(protect, updateTimetable);

router.route('/timetable/:classId')
    .get(protect, getTimetable);

// Event Routes
router.get('/events', protect, getEvents);
router.post('/events', protect, createEvent); // Assuming 'admin' and 'addEvent' are not part of the original instruction's intent for this line
router.delete('/events/:id', protect, deleteEvent); // Assuming 'admin' is not part of the original instruction's intent for this line
router.get('/timetable/:classId', protect, getTimetable);

module.exports = router;
