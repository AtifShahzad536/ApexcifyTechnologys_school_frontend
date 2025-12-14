const User = require('../models/User');
const Class = require('../models/Class');

// @desc    Get all students
// @route   GET /api/students
// @access  Admin
const getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'Student' }).populate('studentClass', 'name section');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a student
// @route   POST /api/students
// @access  Admin
const createStudent = async (req, res) => {
    try {
        const { name, email, password, studentClass, rollNumber, phone, address, parentName, parentEmail, parentPhone } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const student = await User.create({
            name,
            email,
            password,
            role: 'Student',
            studentClass,
            rollNumber,
            phone,
            address
        });

        // Optionally create parent user or link existing one here
        // For simplicity, we are just storing basics now.

        // Add student to Class
        if (studentClass) {
            const cls = await Class.findById(studentClass);
            if (cls) {
                cls.students.push(student._id);
                await cls.save();
            }
        }

        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Admin/Teacher/Student (Self)
const getStudentById = async (req, res) => {
    try {
        const student = await User.findById(req.params.id)
            .populate('studentClass', 'name section')
            .select('-password');

        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Admin
const deleteStudent = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.role !== 'Student') {
            return res.status(400).json({ message: 'User is not a student' });
        }

        // Remove student from class if assigned
        if (student.studentClass) {
            const cls = await Class.findById(student.studentClass);
            if (cls) {
                cls.students = cls.students.filter(s => s.toString() !== student._id.toString());
                await cls.save();
            }
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStudents, createStudent, getStudentById, deleteStudent };
