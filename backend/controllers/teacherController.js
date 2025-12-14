const User = require('../models/User');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Admin
const getTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'Teacher' });
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a teacher
// @route   POST /api/teachers
// @access  Admin
const createTeacher = async (req, res) => {
    try {
        const { name, email, password, qualification, phone, address } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const teacher = await User.create({
            name,
            email,
            password,
            role: 'Teacher',
            qualification,
            phone,
            address
        });

        res.status(201).json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a teacher
// @route   DELETE /api/teachers/:id
// @access  Admin
const deleteTeacher = async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        if (teacher.role !== 'Teacher') {
            return res.status(400).json({ message: 'User is not a teacher' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTeachers, createTeacher, deleteTeacher };
