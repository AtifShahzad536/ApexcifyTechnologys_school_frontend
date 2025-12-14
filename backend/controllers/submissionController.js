const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

// @desc    Submit assignment
// @route   POST /api/submissions
// @access  Student
const submitAssignment = async (req, res) => {
    try {
        const { assignment, content } = req.body;
        const student = req.user._id;

        // Check if assignment exists and is active
        const assignmentDoc = await Assignment.findById(assignment);
        if (!assignmentDoc) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check if already submitted
        const existingSubmission = await Submission.findOne({ assignment, student });
        if (existingSubmission) {
            return res.status(400).json({ message: 'Assignment already submitted' });
        }

        // Check if late
        const isLate = new Date() > new Date(assignmentDoc.dueDate);

        const submission = await Submission.create({
            assignment,
            student,
            content,
            status: isLate ? 'Late' : 'Submitted'
        });

        const populatedSubmission = await Submission.findById(submission._id)
            .populate('assignment', 'title type totalPoints dueDate')
            .populate('student', 'name email rollNumber');

        res.status(201).json(populatedSubmission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submissions
// @route   GET /api/submissions
// @access  Private
const getSubmissions = async (req, res) => {
    try {
        const { assignmentId, studentId, status } = req.query;
        let query = {};

        if (assignmentId) query.assignment = assignmentId;
        if (studentId) query.student = studentId;
        if (status) query.status = status;

        const submissions = await Submission.find(query)
            .populate('assignment', 'title type totalPoints dueDate')
            .populate('student', 'name email rollNumber')
            .populate('gradedBy', 'name')
            .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Teacher
const gradeSubmission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const { grade, feedback } = req.body;

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'Graded';
        submission.gradedBy = req.user._id;
        submission.gradedAt = Date.now();

        const updatedSubmission = await submission.save();
        const populatedSubmission = await Submission.findById(updatedSubmission._id)
            .populate('assignment', 'title type totalPoints')
            .populate('student', 'name email rollNumber')
            .populate('gradedBy', 'name');

        res.json(populatedSubmission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submission statistics
// @route   GET /api/submissions/assignment/:assignmentId/stats
// @access  Teacher
const getSubmissionStats = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const submissions = await Submission.find({ assignment: assignmentId });

        const stats = {
            total: submissions.length,
            submitted: submissions.filter(s => s.status === 'Submitted' || s.status === 'Late').length,
            graded: submissions.filter(s => s.status === 'Graded').length,
            late: submissions.filter(s => s.status === 'Late').length,
            averageGrade: 0
        };

        const gradedSubmissions = submissions.filter(s => s.grade !== undefined && s.grade !== null);
        if (gradedSubmissions.length > 0) {
            const totalGrade = gradedSubmissions.reduce((sum, s) => sum + s.grade, 0);
            stats.averageGrade = (totalGrade / gradedSubmissions.length).toFixed(2);
        }

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update submission
// @route   PUT /api/submissions/:id
// @access  Student
const updateSubmission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        if (submission.status === 'Graded') {
            return res.status(400).json({ message: 'Cannot update graded submission' });
        }

        const { content } = req.body;
        submission.content = content || submission.content;
        submission.submittedAt = Date.now();

        const updatedSubmission = await submission.save();
        const populatedSubmission = await Submission.findById(updatedSubmission._id)
            .populate('assignment', 'title type totalPoints dueDate')
            .populate('student', 'name email rollNumber');

        res.json(populatedSubmission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitAssignment,
    getSubmissions,
    gradeSubmission,
    getSubmissionStats,
    updateSubmission
};
