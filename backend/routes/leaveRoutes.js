const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    applyLeave,
    getMyLeaves,
    getPendingLeaves,
    updateLeaveStatus
} = require('../controllers/leaveController');

router.route('/')
    .post(protect, applyLeave);

router.route('/my')
    .get(protect, getMyLeaves);

router.route('/pending')
    .get(protect, getPendingLeaves); // Add admin check if needed

router.route('/:id')
    .put(protect, updateLeaveStatus);

module.exports = router;
