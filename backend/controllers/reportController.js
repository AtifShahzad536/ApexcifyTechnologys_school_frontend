const Report = require('../models/Report');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Assignment = require('../models/Assignment');

// @desc    Generate report for a student
// @route   POST /api/reports/generate
// @access  Teacher/Admin
const generateReport = async (req, res) => {
    try {
        const { studentId, type, month, year, term, teacherComments, strengths, areasOfImprovement } = req.body;

        const student = await User.findById(studentId).populate('studentClass');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Calculate date range based on type
        let startDate, endDate;
        if (type === 'Monthly Performance') {
            const monthIndex = new Date(Date.parse(month + " 1, " + year)).getMonth();
            startDate = new Date(year, monthIndex, 1);
            endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
        } else {
            // For result cards, use the entire year or term
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        }

        // Get attendance data
        const attendanceRecords = await Attendance.find({
            student: studentId,
            date: { $gte: startDate, $lte: endDate }
        });

        const attendanceStats = {
            total: attendanceRecords.length,
            present: attendanceRecords.filter(a => a.status === 'Present').length,
            absent: attendanceRecords.filter(a => a.status === 'Absent').length,
            late: attendanceRecords.filter(a => a.status === 'Late').length,
            percentage: 0
        };

        if (attendanceStats.total > 0) {
            attendanceStats.percentage = parseFloat(
                ((attendanceStats.present + attendanceStats.late) / attendanceStats.total * 100).toFixed(2)
            );
        }

        // Get grades data
        const grades = await Grade.find({
            student: studentId,
            date: { $gte: startDate, $lte: endDate }
        }).populate('subject', 'name code');

        const gradesBySubject = {};
        grades.forEach(grade => {
            const subjectId = grade.subject._id.toString();
            if (!gradesBySubject[subjectId]) {
                gradesBySubject[subjectId] = {
                    subject: grade.subject,
                    marks: [],
                    totalMarks: []
                };
            }
            gradesBySubject[subjectId].marks.push(grade.marks);
            gradesBySubject[subjectId].totalMarks.push(grade.totalMarks);
        });

        const gradesSummary = Object.values(gradesBySubject).map(subjectData => {
            const totalMarks = subjectData.marks.reduce((a, b) => a + b, 0);
            const totalPossible = subjectData.totalMarks.reduce((a, b) => a + b, 0);
            const percentage = totalPossible > 0 ? (totalMarks / totalPossible * 100) : 0;

            return {
                subject: subjectData.subject._id,
                marks: totalMarks,
                totalMarks: totalPossible,
                percentage: parseFloat(percentage.toFixed(2)),
                grade: calculateGrade(percentage)
            };
        });

        // Calculate overall percentage
        const overallPercentage = gradesSummary.length > 0
            ? parseFloat((gradesSummary.reduce((sum, g) => sum + g.percentage, 0) / gradesSummary.length).toFixed(2))
            : 0;

        // Get assignment data
        const assignments = await Assignment.find({
            class: student.studentClass._id,
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const assignmentStats = {
            total: assignments.length,
            submitted: 0,
            pending: 0,
            graded: 0
        };

        // Check submission status for each assignment
        for (const assignment of assignments) {
            // This would need to check submission model if you have one
            // For now, using placeholder logic
            assignmentStats.submitted = Math.floor(assignments.length * 0.7);
            assignmentStats.pending = assignments.length - assignmentStats.submitted;
            assignmentStats.graded = Math.floor(assignmentStats.submitted * 0.8);
        }

        // Create report
        const report = await Report.create({
            student: studentId,
            type,
            month,
            year,
            term,
            class: student.studentClass._id,
            attendance: attendanceStats,
            grades: gradesSummary,
            overallPercentage,
            overallGrade: calculateGrade(overallPercentage),
            assignments: assignmentStats,
            teacherComments,
            strengths: strengths || [],
            areasOfImprovement: areasOfImprovement || [],
            generatedBy: req.user._id,
            isPublished: false
        });

        const populatedReport = await Report.findById(report._id)
            .populate('student', 'name email rollNumber')
            .populate('class', 'name section')
            .populate('grades.subject', 'name code')
            .populate('generatedBy', 'name');

        res.status(201).json(populatedReport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Publish report (make visible to parents)
// @route   PUT /api/reports/:id/publish
// @access  Teacher/Admin
const publishReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.isPublished = true;
        report.publishedAt = new Date();
        await report.save();

        const populatedReport = await Report.findById(report._id)
            .populate('student', 'name email rollNumber')
            .populate('class', 'name section')
            .populate('grades.subject', 'name code');

        res.json(populatedReport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reports for a student (for parents)
// @route   GET /api/reports/student/:studentId
// @access  Parent/Teacher/Admin
const getStudentReports = async (req, res) => {
    try {
        const { studentId } = req.params;

        const reports = await Report.find({
            student: studentId,
            isPublished: true
        })
            .populate('class', 'name section')
            .populate('grades.subject', 'name code')
            .populate('generatedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reports (for teachers/admin)
// @route   GET /api/reports
// @access  Teacher/Admin
const getAllReports = async (req, res) => {
    try {
        const { classId, type, isPublished } = req.query;

        let query = {};
        if (classId) query.class = classId;
        if (type) query.type = type;
        if (isPublished !== undefined) query.isPublished = isPublished === 'true';

        const reports = await Report.find(query)
            .populate('student', 'name email rollNumber')
            .populate('class', 'name section')
            .populate('generatedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Parent/Teacher/Admin
const getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('student', 'name email rollNumber')
            .populate('class', 'name section')
            .populate('grades.subject', 'name code')
            .populate('generatedBy', 'name');

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Mark as viewed if accessed by parent
        if (req.user.role === 'Parent' && !report.viewedByParent) {
            report.viewedByParent = true;
            report.viewedAt = new Date();
            await report.save();
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Teacher/Admin
const deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        await report.deleteOne();
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to calculate grade
const calculateGrade = (percentage) => {
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

module.exports = {
    generateReport,
    publishReport,
    getStudentReports,
    getAllReports,
    getReportById,
    deleteReport
};
