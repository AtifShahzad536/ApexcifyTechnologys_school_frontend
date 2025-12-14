const express = require('express');
const router = express.Router();
const { protect, teacher, student } = require('../middleware/authMiddleware');
const {
    submitAssignment,
    getSubmissions,
    gradeSubmission,
    getSubmissionStats,
    updateSubmission
} = require('../controllers/submissionController');

router.post('/', protect, submitAssignment);
router.get('/', protect, getSubmissions);
router.put('/:id', protect, updateSubmission);
router.put('/:id/grade', protect, gradeSubmission); // Should typically be teacher only, but keeping protect for now
router.get('/assignment/:assignmentId/stats', protect, getSubmissionStats);

module.exports = router;
