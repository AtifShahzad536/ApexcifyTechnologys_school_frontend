const express = require('express');
const router = express.Router();
const {
    generateResult,
    getResultByStudent,
    getResultsByClass,
    getResultById,
    deleteResult
} = require('../controllers/resultController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/generate', protect, admin, generateResult);
router.get('/student/:studentId', protect, getResultByStudent);
router.get('/class/:classId', protect, getResultsByClass);
router.get('/:id', protect, getResultById);
router.delete('/:id', protect, admin, deleteResult);

module.exports = router;
