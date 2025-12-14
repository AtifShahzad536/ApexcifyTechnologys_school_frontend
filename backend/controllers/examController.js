const Exam = require('../models/Exam');
const ExamSubmission = require('../models/ExamSubmission');
const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Create Exam
// @route   POST /api/exams
// @access  Teacher/Admin
const createExam = async (req, res) => {
    try {
        const { title, subject, class: classId, startTime, duration, questions } = req.body;

        // Calculate total marks
        const totalMarks = questions.reduce((acc, q) => acc + parseInt(q.marks), 0);

        const exam = await Exam.create({
            title,
            subject,
            class: classId,
            createdBy: req.user._id,
            startTime,
            duration,
            totalMarks,
            questions
        });

        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Exams (For Student: available exams; For Teacher/Admin: created exams)
// @route   GET /api/exams
// @access  Private
const getExams = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Student') {
            // Query the User model to get student's class
            console.log('Student ID:', req.user._id);
            const student = await User.findById(req.user._id).populate('studentClass');
            console.log('Student found:', student ? 'Yes' : 'No');
            console.log('Student class:', student?.studentClass);

            if (student && student.studentClass) {
                query.class = student.studentClass._id;
                query.isActive = true;
                console.log('Query for exams:', query);
            } else {
                console.log('No student class found, returning empty array');
                return res.json([]);
            }
        } else if (req.user.role === 'Teacher' || req.user.role === 'Admin') {
            query.createdBy = req.user._id;
        }

        const exams = await Exam.find(query)
            .populate('subject', 'name')
            .populate('class', 'name section')
            .sort({ startTime: -1 });

        console.log('Exams found:', exams.length);

        // For students, check if already submitted
        if (req.user.role === 'Student') {
            const examsWithStatus = await Promise.all(exams.map(async (exam) => {
                const submission = await ExamSubmission.findOne({ exam: exam._id, student: req.user._id });
                return { ...exam.toObject(), submitted: !!submission, score: submission ? submission.score : null };
            }));
            return res.json(examsWithStatus);
        }

        res.json(exams);
    } catch (error) {
        console.error('Error in getExams:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Single Exam (with questions)
// @route   GET /api/exams/:id
// @access  Private
const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        // If student, check if valid time? (Optional logic)
        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit Exam & Auto-Mark
// @route   POST /api/exams/:id/submit
// @access  Student
const submitExam = async (req, res) => {
    try {
        const { answers } = req.body;
        const exam = await Exam.findById(req.params.id);

        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        // Check if already submitted
        const existingSubmission = await ExamSubmission.findOne({ exam: exam._id, student: req.user._id });
        if (existingSubmission) {
            return res.status(400).json({ message: 'You have already submitted this exam' });
        }

        let score = 0;

        // Auto-marking logic
        // answers array of { questionIndex, selectedOption } (assuming sequential or id mapping)
        // Let's assume answers is array of indices matching exam.questions index

        answers.forEach((ans, index) => { // ans is selectedOption index
            if (exam.questions[index] && exam.questions[index].correctOption === ans) {
                score += exam.questions[index].marks;
            }
        });

        const submission = await ExamSubmission.create({
            exam: exam._id,
            student: req.user._id,
            answers: answers.map((ans, idx) => ({ selectedOption: ans })),
            score,
            status: 'Graded'
        });

        res.json({ message: 'Exam submitted successfully', score, totalMarks: exam.totalMarks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Exam
// @route   DELETE /api/exams/:id
// @access  Teacher/Admin
const deleteExam = async (req, res) => {
    try {
        await Exam.findByIdAndDelete(req.params.id);
        res.json({ message: 'Exam deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createExam,
    getExams,
    getExamById,
    submitExam,
    deleteExam
};
