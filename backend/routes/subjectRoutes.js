const express = require('express');
const router = express.Router();
const {
    createSubject,
    getSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
} = require('../controllers/subjectController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, createSubject)
    .get(protect, getSubjects);

router.route('/:id')
    .get(protect, getSubjectById)
    .put(protect, admin, updateSubject)
    .delete(protect, admin, deleteSubject);

module.exports = router;
