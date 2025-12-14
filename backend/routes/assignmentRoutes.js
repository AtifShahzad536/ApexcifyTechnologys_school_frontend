const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createAssignment,
    getAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment
} = require('../controllers/assignmentController');

router.route('/')
    .post(protect, createAssignment)
    .get(protect, getAssignments);

router.route('/:id')
    .get(protect, getAssignmentById)
    .put(protect, updateAssignment)
    .delete(protect, deleteAssignment);

module.exports = router;
