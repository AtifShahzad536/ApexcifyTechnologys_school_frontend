const Subject = require('../models/Subject');

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Admin
const createSubject = async (req, res) => {
    try {
        const { name, code, class: classId, teacher, credits, description } = req.body;

        // Check if subject with same code already exists
        const subjectExists = await Subject.findOne({ code });
        if (subjectExists) {
            return res.status(400).json({ message: 'Subject with this code already exists' });
        }

        const subject = await Subject.create({
            name,
            code,
            class: classId,
            teacher,
            credits,
            description
        });

        const populatedSubject = await Subject.findById(subject._id)
            .populate('class', 'name section')
            .populate('teacher', 'name email');

        res.status(201).json(populatedSubject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
    try {
        const { classId, teacherId } = req.query;
        let query = {};

        if (classId) query.class = classId;
        if (teacherId) query.teacher = teacherId;

        const subjects = await Subject.find(query)
            .populate('class', 'name section')
            .populate('teacher', 'name email')
            .sort({ createdAt: -1 });

        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
const getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id)
            .populate('class', 'name section')
            .populate('teacher', 'name email');

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        res.json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Admin
const updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        const { name, code, class: classId, teacher, credits, description } = req.body;

        subject.name = name || subject.name;
        subject.code = code || subject.code;
        subject.class = classId || subject.class;
        subject.teacher = teacher || subject.teacher;
        subject.credits = credits || subject.credits;
        subject.description = description || subject.description;

        const updatedSubject = await subject.save();
        const populatedSubject = await Subject.findById(updatedSubject._id)
            .populate('class', 'name section')
            .populate('teacher', 'name email');

        res.json(populatedSubject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Admin
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        await subject.deleteOne();
        res.json({ message: 'Subject removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSubject,
    getSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
};
