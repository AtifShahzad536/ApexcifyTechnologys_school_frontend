const Leave = require('../models/Leave');
const User = require('../models/User');

// @desc    Apply for Leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        const leave = await Leave.create({
            user: req.user._id,
            leaveType,
            startDate,
            endDate,
            reason
        });

        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get My Leaves
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Pending Leaves (Admin/Teacher view)
// @route   GET /api/leaves/pending
// @access  Admin/Teacher
const getPendingLeaves = async (req, res) => {
    try {
        let query = { status: 'Pending' };

        // If Teacher, only see students of own classes? 
        // For simplicity now, Admin sees all, Teacher might see none or all students.
        // Let's restrict: Admin sees all. Teacher sees students.

        if (req.user.role === 'Teacher') {
            // Find students in teacher's classes (Complex logic, skipping for v1)
            // For now, let's allow Teachers to approve Student leaves if we want
            // Or just make it Admin only for simplicity.
            // Let's assume Admin handles all Staff leaves, and Teachers/Admin handle Student leaves.
        }

        const leaves = await Leave.find(query)
            .populate('user', 'name email role studentClass')
            .sort({ createdAt: 1 });

        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Leave Status
// @route   PUT /api/leaves/:id
// @access  Admin (or Teacher)
const updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        leave.status = status;
        leave.approvedBy = req.user._id;
        await leave.save();

        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    applyLeave,
    getMyLeaves,
    getPendingLeaves,
    updateLeaveStatus
};
