const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createExam,
    getExams,
    getExamById,
    submitExam,
    deleteExam
} = require('../controllers/examController');

router.route('/')
    .post(protect, createExam)
    .get(protect, getExams);

router.route('/:id')
    .get(protect, getExamById)
    .delete(protect, deleteExam);

router.route('/:id/submit')
    .post(protect, submitExam);

module.exports = router;
