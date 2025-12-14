const Timetable = require('../models/Timetable');
const Event = require('../models/Event');
const Class = require('../models/Class');

// --- Timetable Controllers ---

// @desc    Create or Update Timetable for a class
// @route   POST /api/calendar/timetable
// @access  Admin/Teacher
const updateTimetable = async (req, res) => {
    try {
        const { classId, days } = req.body;

        let timetable = await Timetable.findOne({ class: classId });

        if (timetable) {
            timetable.days = days;
            await timetable.save();
        } else {
            timetable = await Timetable.create({
                class: classId,
                days
            });
        }

        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Timetable by class
// @route   GET /api/calendar/timetable/:classId
// @access  Public (Protected by Auth middleware eventually)
const getTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.findOne({ class: req.params.classId })
            .populate('days.periods.subject', 'name')
            .populate('days.periods.teacher', 'name');

        if (!timetable) {
            return res.json({
                class: req.params.classId,
                days: [
                    { day: 'Monday', periods: [] },
                    { day: 'Tuesday', periods: [] },
                    { day: 'Wednesday', periods: [] },
                    { day: 'Thursday', periods: [] },
                    { day: 'Friday', periods: [] }
                ]
            });
        }

        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Event Controllers ---

// @desc    Create Event
// @route   POST /api/calendar/events
// @access  Admin
const createEvent = async (req, res) => {
    try {
        const { title, description, date, type, isOnline, meetingLink } = req.body;
        const event = await Event.create({
            title,
            description,
            date,
            type,
            isOnline,
            meetingLink,
            createdBy: req.user._id
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Events
// @route   GET /api/calendar/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Event
// @route   DELETE /api/calendar/events/:id
// @access  Admin
const deleteEvent = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    updateTimetable,
    getTimetable,
    createEvent,
    getEvents,
    deleteEvent
};
