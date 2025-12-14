const Grade = require('../models/Grade');

// Helper to calculate grade
const calculateGrade = (marks, totalMarks) => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    if (percentage >= 40) return 'D';
    return 'F';
};

// @desc    Add a new grade
// @route   POST /api/grades
// @access  Teacher
const addGrade = async (req, res) => {
    try {
        const { student, subject, examType, marks, totalMarks, remarks, date } = req.body;
        const teacher = req.user._id;

        const gradeValue = calculateGrade(marks, totalMarks || 100);

        const grade = await Grade.create({
            student,
            subject,
            examType,
            marks,
            totalMarks: totalMarks || 100,
            grade: gradeValue,
            remarks,
            teacher,
            date: date || Date.now()
        });

        const populatedGrade = await Grade.findById(grade._id)
            .populate('student', 'name email rollNumber')
            .populate('subject', 'name code')
            .populate('teacher', 'name');

        res.status(201).json(populatedGrade);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all grades (with optional filtering)
// @route   GET /api/grades
// @access  Teacher/Admin
const getAllGrades = async (req, res) => {
    try {
        const grades = await Grade.find({})
            .populate('student', 'name email rollNumber')
            .populate('subject', 'name code')
            .populate('teacher', 'name')
            .sort({ date: -1 });
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... (getGrades functions remain same, omitted for brevity in this chunk if possible? No, I must replace contiguous block) ...

// @desc    Get grades by student
// @route   GET /api/grades/student/:studentId
// @access  Private
const getGradesByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { subject, examType } = req.query;

        let query = { student: studentId };
        if (subject) query.subject = subject;
        if (examType) query.examType = examType;

        const grades = await Grade.find(query)
            .populate('subject', 'name code')
            .populate('teacher', 'name')
            .sort({ date: -1 });

        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get grades by subject
// @route   GET /api/grades/subject/:subjectId
// @access  Teacher
const getGradesBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { examType } = req.query;

        let query = { subject: subjectId };
        if (examType) query.examType = examType;

        const grades = await Grade.find(query)
            .populate('student', 'name email rollNumber')
            .populate('teacher', 'name')
            .sort({ date: -1 });

        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a grade
// @route   PUT /api/grades/:id
// @access  Teacher
const updateGrade = async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id);

        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        const { marks, totalMarks, remarks, examType } = req.body;

        grade.marks = marks !== undefined ? marks : grade.marks;
        grade.totalMarks = totalMarks || grade.totalMarks;
        grade.remarks = remarks || grade.remarks;
        grade.examType = examType || grade.examType;

        // Recalculate grade explicitly
        grade.grade = calculateGrade(grade.marks, grade.totalMarks);

        const updatedGrade = await grade.save();
        const populatedGrade = await Grade.findById(updatedGrade._id)
            .populate('student', 'name email rollNumber')
            .populate('subject', 'name code')
            .populate('teacher', 'name');

        res.json(populatedGrade);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a grade
// @route   DELETE /api/grades/:id
// @access  Teacher/Admin
const deleteGrade = async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id);

        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        await grade.deleteOne();
        res.json({ message: 'Grade removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get grade statistics for a student
// @route   GET /api/grades/student/:studentId/stats
// @access  Private
const getStudentGradeStats = async (req, res) => {
    try {
        const { studentId } = req.params;

        const grades = await Grade.find({ student: studentId })
            .populate('subject', 'name');

        const stats = {
            totalGrades: grades.length,
            averageMarks: 0,
            subjectWise: {}
        };

        if (grades.length > 0) {
            const totalMarks = grades.reduce((sum, grade) => {
                const percentage = (grade.marks / grade.totalMarks) * 100;
                return sum + percentage;
            }, 0);
            stats.averageMarks = (totalMarks / grades.length).toFixed(2);

            // Subject-wise stats
            grades.forEach(grade => {
                const subjectName = grade.subject.name;
                if (!stats.subjectWise[subjectName]) {
                    stats.subjectWise[subjectName] = {
                        count: 0,
                        totalPercentage: 0,
                        grades: []
                    };
                }
                const percentage = (grade.marks / grade.totalMarks) * 100;
                stats.subjectWise[subjectName].count++;
                stats.subjectWise[subjectName].totalPercentage += percentage;
                stats.subjectWise[subjectName].grades.push(grade.grade);
            });

            // Calculate averages for each subject
            Object.keys(stats.subjectWise).forEach(subject => {
                const subjectData = stats.subjectWise[subject];
                subjectData.average = (subjectData.totalPercentage / subjectData.count).toFixed(2);
            });
        }

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addGrade,
    getAllGrades,
    getGradesByStudent,
    getGradesByStudent,
    getGradesBySubject,
    updateGrade,
    deleteGrade,
    getStudentGradeStats
};
