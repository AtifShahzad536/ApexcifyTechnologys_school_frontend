const User = require('../models/User');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Result = require('../models/Result');

// @desc    Get all parents
// @route   GET /api/parents
// @access  Admin
const getAllParents = async (req, res) => {
    try {
        const parents = await User.find({ role: 'Parent' }).select('-password');
        res.json(parents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get parent's children
// @route   GET /api/parents/children
// @access  Parent
const getMyChildren = async (req, res) => {
    try {
        const parent = await User.findById(req.user._id)
            .populate({
                path: 'children',
                select: '-password',
                populate: {
                    path: 'studentClass',
                    select: 'name section'
                }
            });

        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        res.json(parent.children);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get child's grades
// @route   GET /api/parents/children/:id/grades
// @access  Parent
const getChildGrades = async (req, res) => {
    try {
        const parent = await User.findById(req.user._id);

        // Verify this child belongs to the parent
        if (!parent.children.includes(req.params.id)) {
            return res.status(403).json({ message: 'Not authorized to view this child' });
        }

        const grades = await Grade.find({ student: req.params.id })
            .populate('subject', 'name')
            .populate('teacher', 'name')
            .sort({ createdAt: -1 });

        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get child's attendance
// @route   GET /api/parents/children/:id/attendance
// @access  Parent
const getChildAttendance = async (req, res) => {
    try {
        const parent = await User.findById(req.user._id);

        if (!parent.children.includes(req.params.id)) {
            return res.status(403).json({ message: 'Not authorized to view this child' });
        }

        const attendance = await Attendance.find({ student: req.params.id })
            .populate('subject', 'name')
            .populate('markedBy', 'name')
            .sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get child's assignments and submissions
// @route   GET /api/parents/children/:id/assignments
// @access  Parent
const getChildAssignments = async (req, res) => {
    try {
        const parent = await User.findById(req.user._id);

        if (!parent.children.includes(req.params.id)) {
            return res.status(403).json({ message: 'Not authorized to view this child' });
        }

        const child = await User.findById(req.params.id).populate('studentClass');

        if (!child || !child.studentClass) {
            return res.status(404).json({ message: 'Child or class not found' });
        }

        // Get all assignments for the child's class
        const assignments = await Assignment.find({ class: child.studentClass._id })
            .populate('subject', 'name')
            .populate('teacher', 'name')
            .sort({ dueDate: -1 });

        // Get submissions for this child
        const submissions = await Submission.find({ student: req.params.id });

        // Combine assignments with submission status
        const assignmentsWithStatus = assignments.map(assignment => {
            const submission = submissions.find(
                sub => sub.assignment.toString() === assignment._id.toString()
            );

            return {
                ...assignment.toObject(),
                submission: submission || null,
                status: submission ? submission.status : 'Not Submitted'
            };
        });

        res.json(assignmentsWithStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get child's results
// @route   GET /api/parents/children/:id/results
// @access  Parent
const getChildResults = async (req, res) => {
    try {
        const parent = await User.findById(req.user._id);

        if (!parent.children.includes(req.params.id)) {
            return res.status(403).json({ message: 'Not authorized to view this child' });
        }

        const results = await Result.find({ student: req.params.id })
            .populate('class', 'name section')
            .sort({ term: -1, year: -1 });

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get child's dashboard stats
// @route   GET /api/parents/children/:id/stats
// @access  Parent
const getChildStats = async (req, res) => {
    try {
        const parent = await User.findById(req.user._id);

        if (!parent.children.includes(req.params.id)) {
            return res.status(403).json({ message: 'Not authorized to view this child' });
        }

        // Get attendance stats
        const totalAttendance = await Attendance.countDocuments({ student: req.params.id });
        const presentCount = await Attendance.countDocuments({
            student: req.params.id,
            status: 'Present'
        });
        const attendancePercentage = totalAttendance > 0
            ? ((presentCount / totalAttendance) * 100).toFixed(1)
            : 0;

        // Get grade average
        const grades = await Grade.find({ student: req.params.id });
        const averageGrade = grades.length > 0
            ? (grades.reduce((sum, g) => sum + g.marks, 0) / grades.length).toFixed(1)
            : 0;

        // Get assignment stats
        const child = await User.findById(req.params.id).populate('studentClass');
        const totalAssignments = child.studentClass
            ? await Assignment.countDocuments({ class: child.studentClass._id })
            : 0;
        const submittedAssignments = await Submission.countDocuments({
            student: req.params.id
        });

        res.json({
            attendance: {
                total: totalAttendance,
                present: presentCount,
                percentage: attendancePercentage
            },
            grades: {
                average: averageGrade,
                total: grades.length
            },
            assignments: {
                total: totalAssignments,
                submitted: submittedAssignments,
                pending: totalAssignments - submittedAssignments
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllParents,
    getMyChildren,
    getChildGrades,
    getChildAttendance,
    getChildAssignments,
    getChildResults,
    getChildStats
};
