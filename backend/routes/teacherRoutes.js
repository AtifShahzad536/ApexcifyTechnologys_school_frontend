const express = require('express');
const router = express.Router();
const { getTeachers, createTeacher, deleteTeacher } = require('../controllers/teacherController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getTeachers)
    .post(protect, admin, createTeacher);

router.route('/:id')
    .delete(protect, admin, deleteTeacher);

module.exports = router;
