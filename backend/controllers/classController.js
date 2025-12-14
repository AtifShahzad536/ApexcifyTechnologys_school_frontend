const Class = require('../models/Class');

// @desc    Create a new class
// @route   POST /api/classes
// @access  Admin
const createClass = async (req, res) => {
    try {
        const { name, section } = req.body;

        const classExists = await Class.findOne({ name, section });

        if (classExists) {
            return res.status(400).json({ message: 'Class already exists' });
        }

        const newClass = await Class.create({
            name,
            section
        });

        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all classes
// @route   GET /api/classes
// @access  Admin/Teacher
const getClasses = async (req, res) => {
    try {
        const classes = await Class.find({});
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Admin
const deleteClass = async (req, res) => {
    try {
        const classToDelete = await Class.findById(req.params.id);

        if (!classToDelete) {
            return res.status(404).json({ message: 'Class not found' });
        }

        await Class.findByIdAndDelete(req.params.id);
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createClass, getClasses, deleteClass };
