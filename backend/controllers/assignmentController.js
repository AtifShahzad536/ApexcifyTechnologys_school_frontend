const Assignment = require('../models/Assignment');

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Teacher
const createAssignment = async (req, res) => {
    try {
        const { title, description, type, subject, class: classId, dueDate, totalPoints, instructions } = req.body;
        const teacher = req.user._id;

        const assignment = await Assignment.create({
            title,
            description,
            type,
            subject,
            class: classId,
            teacher,
            dueDate,
            totalPoints,
            instructions
        });

        const populatedAssignment = await Assignment.findById(assignment._id)
            .populate('subject', 'name code')
            .populate('class', 'name section')
            .populate('teacher', 'name');

        res.status(201).json(populatedAssignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res) => {
    try {
        const { classId, subjectId, teacherId, type, status } = req.query;
        let query = {};

        if (classId) query.class = classId;
        if (subjectId) query.subject = subjectId;
        if (teacherId) query.teacher = teacherId;
        if (type) query.type = type;
        if (status) query.status = status;

        const assignments = await Assignment.find(query)
            .populate('subject', 'name code')
            .populate('class', 'name section')
            .populate('teacher', 'name')
            .sort({ dueDate: -1 });

        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
const getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('subject', 'name code')
            .populate('class', 'name section')
            .populate('teacher', 'name email');

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Teacher
const updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const { title, description, type, dueDate, totalPoints, instructions, status } = req.body;

        assignment.title = title || assignment.title;
        assignment.description = description || assignment.description;
        assignment.type = type || assignment.type;
        assignment.dueDate = dueDate || assignment.dueDate;
        assignment.totalPoints = totalPoints || assignment.totalPoints;
        assignment.instructions = instructions || assignment.instructions;
        assignment.status = status || assignment.status;

        const updatedAssignment = await assignment.save();
        const populatedAssignment = await Assignment.findById(updatedAssignment._id)
            .populate('subject', 'name code')
            .populate('class', 'name section')
            .populate('teacher', 'name');

        res.json(populatedAssignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Teacher/Admin
const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        await assignment.deleteOne();
        res.json({ message: 'Assignment removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAssignment,
    getAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment
};
