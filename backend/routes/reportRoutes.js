const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    generateReport,
    publishReport,
    getStudentReports,
    getAllReports,
    getReportById,
    deleteReport
} = require('../controllers/reportController');

router.post('/generate', protect, generateReport);
router.put('/:id/publish', protect, publishReport);
router.get('/student/:studentId', protect, getStudentReports);
router.get('/', protect, getAllReports);
router.get('/:id', protect, getReportById);
router.delete('/:id', protect, deleteReport);

module.exports = router;
