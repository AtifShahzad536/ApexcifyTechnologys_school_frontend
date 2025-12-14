const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    addGrade,
    getAllGrades,
    getGradesByStudent,
    getGradesBySubject,
    updateGrade,
    deleteGrade,
    getStudentGradeStats
} = require('../controllers/gradeController');

router.post('/', protect, addGrade);
router.get('/', protect, getAllGrades);
router.get('/student/:studentId', protect, getGradesByStudent);
router.get('/student/:studentId/stats', protect, getStudentGradeStats);
router.get('/subject/:subjectId', protect, getGradesBySubject);
router.put('/:id', protect, updateGrade);
router.delete('/:id', protect, deleteGrade);

module.exports = router;
