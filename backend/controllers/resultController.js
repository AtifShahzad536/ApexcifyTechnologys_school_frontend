const Result = require('../models/Result');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');

// @desc    Generate result for a student
// @route   POST /api/results/generate
// @access  Admin/Teacher
const generateResult = async (req, res) => {
    try {
        const { student, class: classId, term, academicYear } = req.body;
        const generatedBy = req.user._id;

        // Get all grades for the student in this term
        const grades = await Grade.find({ student }).populate('subject');

        if (grades.length === 0) {
            return res.status(400).json({ message: 'No grades found for this student' });
        }

        // Calculate subject-wise marks
        const subjectResults = {};
        grades.forEach(grade => {
            const subjectId = grade.subject._id.toString();
            if (!subjectResults[subjectId]) {
                subjectResults[subjectId] = {
                    subject: grade.subject._id,
                    totalMarks: 0,
                    obtainedMarks: 0,
                    count: 0
                };
            }
            subjectResults[subjectId].totalMarks += grade.totalMarks;
            subjectResults[subjectId].obtainedMarks += grade.marks;
            subjectResults[subjectId].count++;
        });

        // Calculate overall marks and prepare subjects array
        let totalMarks = 0;
        let obtainedMarks = 0;
        const subjects = [];

        Object.values(subjectResults).forEach(subjectData => {
            const percentage = (subjectData.obtainedMarks / subjectData.totalMarks) * 100;
            let grade;

            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 85) grade = 'A';
            else if (percentage >= 80) grade = 'A-';
            else if (percentage >= 75) grade = 'B+';
            else if (percentage >= 70) grade = 'B';
            else if (percentage >= 65) grade = 'B-';
            else if (percentage >= 60) grade = 'C+';
            else if (percentage >= 55) grade = 'C';
            else if (percentage >= 50) grade = 'C-';
            else if (percentage >= 40) grade = 'D';
            else grade = 'F';

            subjects.push({
                subject: subjectData.subject,
                totalMarks: subjectData.totalMarks,
                obtainedMarks: subjectData.obtainedMarks,
                grade
            });

            totalMarks += subjectData.totalMarks;
            obtainedMarks += subjectData.obtainedMarks;
        });

        // Get attendance percentage
        const attendanceRecords = await Attendance.find({ student });
        let attendancePercentage = 0;
        if (attendanceRecords.length > 0) {
            const presentCount = attendanceRecords.filter(a =>
                a.status === 'Present' || a.status === 'Late'
            ).length;
            attendancePercentage = (presentCount / attendanceRecords.length * 100).toFixed(2);
        }

        // Create or update result
        const resultData = {
            student,
            class: classId,
            term,
            academicYear,
            subjects,
            totalMarks,
            obtainedMarks,
            attendance: attendancePercentage,
            generatedBy
        };

        let result = await Result.findOne({ student, term, academicYear });

        if (result) {
            // Update existing result
            Object.assign(result, resultData);
            await result.save();
        } else {
            // Create new result
            result = await Result.create(resultData);
        }

        const populatedResult = await Result.findById(result._id)
            .populate('student', 'name email rollNumber')
            .populate('class', 'name section')
            .populate('subjects.subject', 'name code')
            .populate('generatedBy', 'name');

        res.status(201).json(populatedResult);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get result by student
// @route   GET /api/results/student/:studentId
// @access  Private
const getResultByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { term, academicYear } = req.query;

        let query = { student: studentId };
        if (term) query.term = term;
        if (academicYear) query.academicYear = academicYear;

        const results = await Result.find(query)
            .populate('class', 'name section')
            .populate('subjects.subject', 'name code')
            .sort({ createdAt: -1 });

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get results by class
// @route   GET /api/results/class/:classId
// @access  Teacher/Admin
const getResultsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { term, academicYear } = req.query;

        let query = { class: classId };
        if (term) query.term = term;
        if (academicYear) query.academicYear = academicYear;

        const results = await Result.find(query)
            .populate('student', 'name email rollNumber')
            .populate('subjects.subject', 'name code')
            .sort({ percentage: -1 });

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single result
// @route   GET /api/results/:id
// @access  Private
const getResultById = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id)
            .populate('student', 'name email rollNumber')
            .populate('class', 'name section')
            .populate('subjects.subject', 'name code credits')
            .populate('generatedBy', 'name');

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete result
// @route   DELETE /api/results/:id
// @access  Admin
const deleteResult = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        await result.deleteOne();
        res.json({ message: 'Result removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generateResult,
    getResultByStudent,
    getResultsByClass,
    getResultById,
    deleteResult
};
