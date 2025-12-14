const Attendance = require('../models/Attendance');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Teacher
const markAttendance = async (req, res) => {
    try {
        const { student, class: classId, subject, date, status, remarks } = req.body;
        const markedBy = req.user._id; // Assuming auth middleware

        // Check if attendance already marked for this student on this date for this subject
        const existingAttendance = await Attendance.findOne({
            student,
            date: new Date(date).setHours(0, 0, 0, 0),
            subject
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Attendance already marked for this student today' });
        }

        const attendance = await Attendance.create({
            student,
            class: classId,
            subject,
            date,
            status,
            markedBy,
            remarks
        });

        const populatedAttendance = await Attendance.findById(attendance._id)
            .populate('student', 'name email rollNumber')
            .populate('class', 'name section')
            .populate('subject', 'name code')
            .populate('markedBy', 'name');

        res.status(201).json(populatedAttendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark bulk attendance
// @route   POST /api/attendance/bulk
// @access  Teacher
const markBulkAttendance = async (req, res) => {
    try {
        const { attendanceRecords, class: classId, subject, date } = req.body;
        const markedBy = req.user._id;

        const attendancePromises = attendanceRecords.map(record => {
            return Attendance.create({
                student: record.student,
                class: classId,
                subject,
                date,
                status: record.status,
                markedBy,
                remarks: record.remarks
            });
        });

        const createdAttendance = await Promise.all(attendancePromises);
        res.status(201).json({
            message: 'Attendance marked successfully',
            count: createdAttendance.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance by student
// @route   GET /api/attendance/student/:studentId
// @access  Private
const getAttendanceByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { startDate, endDate, subject } = req.query;

        let query = { student: studentId };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (subject) query.subject = subject;

        const attendance = await Attendance.find(query)
            .populate('subject', 'name code')
            .populate('class', 'name section')
            .sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance by class
// @route   GET /api/attendance/class/:classId
// @access  Teacher
const getAttendanceByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { date, subject } = req.query;

        let query = { class: classId };

        if (date) {
            query.date = new Date(date).setHours(0, 0, 0, 0);
        }

        if (subject) query.subject = subject;

        const attendance = await Attendance.find(query)
            .populate('student', 'name email rollNumber')
            .populate('subject', 'name code')
            .sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/student/:studentId/stats
// @access  Private
const getAttendanceStats = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { startDate, endDate } = req.query;

        let query = { student: studentId };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query);

        const stats = {
            total: attendance.length,
            present: attendance.filter(a => a.status === 'Present').length,
            absent: attendance.filter(a => a.status === 'Absent').length,
            late: attendance.filter(a => a.status === 'Late').length,
            excused: attendance.filter(a => a.status === 'Excused').length,
            percentage: 0
        };

        if (stats.total > 0) {
            stats.percentage = ((stats.present + stats.late) / stats.total * 100).toFixed(2);
        }

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Teacher
const updateAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        const { status, remarks } = req.body;

        attendance.status = status || attendance.status;
        attendance.remarks = remarks !== undefined ? remarks : attendance.remarks;

        const updatedAttendance = await attendance.save();
        const populatedAttendance = await Attendance.findById(updatedAttendance._id)
            .populate('student', 'name email rollNumber')
            .populate('class', 'name section')
            .populate('subject', 'name code');

        res.json(populatedAttendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students attendance stats
// @route   GET /api/attendance/reports/all-students
// @access  Admin/Teacher
const getAllStudentsAttendance = async (req, res) => {
    try {
        const { classId, startDate, endDate } = req.query;
        const User = require('../models/User');

        // Build query for students
        let studentQuery = { role: 'Student', status: 'Approved' };
        if (classId) {
            studentQuery.studentClass = classId;
        }

        const students = await User.find(studentQuery)
            .populate('studentClass', 'name section')
            .select('name email rollNumber studentClass');

        // Get attendance stats for each student
        const studentsWithStats = await Promise.all(
            students.map(async (student) => {
                let attendanceQuery = { student: student._id };

                if (startDate && endDate) {
                    attendanceQuery.date = {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    };
                }

                const attendance = await Attendance.find(attendanceQuery);

                const stats = {
                    total: attendance.length,
                    present: attendance.filter(a => a.status === 'Present').length,
                    absent: attendance.filter(a => a.status === 'Absent').length,
                    late: attendance.filter(a => a.status === 'Late').length,
                    excused: attendance.filter(a => a.status === 'Excused').length,
                    percentage: 0
                };

                if (stats.total > 0) {
                    stats.percentage = parseFloat(((stats.present + stats.late) / stats.total * 100).toFixed(2));
                }

                return {
                    _id: student._id,
                    name: student.name,
                    email: student.email,
                    rollNumber: student.rollNumber,
                    class: student.studentClass,
                    attendance: stats
                };
            })
        );

        // Sort by percentage (lowest first to highlight issues)
        studentsWithStats.sort((a, b) => a.attendance.percentage - b.attendance.percentage);

        res.json(studentsWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get performance report for a student
// @route   GET /api/attendance/reports/performance/:studentId
// @access  Admin/Teacher
const getStudentPerformanceReport = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { startDate, endDate } = req.query;
        const User = require('../models/User');
        const Grade = require('../models/Grade');

        const student = await User.findById(studentId)
            .populate('studentClass', 'name section')
            .select('name email rollNumber studentClass');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Attendance stats
        let attendanceQuery = { student: studentId };
        if (startDate && endDate) {
            attendanceQuery.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(attendanceQuery);
        const attendanceStats = {
            total: attendance.length,
            present: attendance.filter(a => a.status === 'Present').length,
            absent: attendance.filter(a => a.status === 'Absent').length,
            late: attendance.filter(a => a.status === 'Late').length,
            percentage: 0
        };

        if (attendanceStats.total > 0) {
            attendanceStats.percentage = parseFloat(
                ((attendanceStats.present + attendanceStats.late) / attendanceStats.total * 100).toFixed(2)
            );
        }

        // Grade stats
        let gradeQuery = { student: studentId };
        const grades = await Grade.find(gradeQuery).populate('subject', 'name');

        const gradeStats = {
            total: grades.length,
            average: 0,
            highest: 0,
            lowest: 100,
            bySubject: {}
        };

        if (grades.length > 0) {
            const percentages = grades.map(g => g.percentage);
            gradeStats.average = parseFloat((percentages.reduce((a, b) => a + b, 0) / grades.length).toFixed(2));
            gradeStats.highest = Math.max(...percentages);
            gradeStats.lowest = Math.min(...percentages);

            // Group by subject
            grades.forEach(grade => {
                const subjectName = grade.subject?.name || 'Unknown';
                if (!gradeStats.bySubject[subjectName]) {
                    gradeStats.bySubject[subjectName] = {
                        grades: [],
                        average: 0
                    };
                }
                gradeStats.bySubject[subjectName].grades.push(grade.percentage);
            });

            // Calculate average per subject
            Object.keys(gradeStats.bySubject).forEach(subject => {
                const subjectGrades = gradeStats.bySubject[subject].grades;
                gradeStats.bySubject[subject].average = parseFloat(
                    (subjectGrades.reduce((a, b) => a + b, 0) / subjectGrades.length).toFixed(2)
                );
            });
        }

        res.json({
            student: {
                _id: student._id,
                name: student.name,
                email: student.email,
                rollNumber: student.rollNumber,
                class: student.studentClass
            },
            attendance: attendanceStats,
            grades: gradeStats,
            generatedAt: new Date()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markAttendance,
    markBulkAttendance,
    getAttendanceByStudent,
    getAttendanceByClass,
    getAttendanceStats,
    updateAttendance,
    getAllStudentsAttendance,
    getStudentPerformanceReport
};
