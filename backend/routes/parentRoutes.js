const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAllParents,
    getMyChildren,
    getChildGrades,
    getChildAttendance,
    getChildAssignments,
    getChildResults,
    getChildStats
} = require('../controllers/parentController');

// All routes require authentication
router.use(protect);

// Get all parents (Admin only)
router.get('/', getAllParents);

// Get my children
router.get('/children', getMyChildren);

// Get child's stats
router.get('/children/:id/stats', getChildStats);

// Get child's grades
router.get('/children/:id/grades', getChildGrades);

// Get child's attendance
router.get('/children/:id/attendance', getChildAttendance);

// Get child's assignments
router.get('/children/:id/assignments', getChildAssignments);

// Get child's results
router.get('/children/:id/results', getChildResults);

module.exports = router;
