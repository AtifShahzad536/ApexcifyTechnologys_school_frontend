const express = require('express');
const router = express.Router();
const { getStudents, createStudent, getStudentById, deleteStudent } = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getStudents)
    .post(protect, admin, createStudent);

router.route('/:id')
    .get(protect, getStudentById)
    .delete(protect, admin, deleteStudent);

module.exports = router;
