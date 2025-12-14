const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getPendingUsers,
    getPendingCount,
    approveUser,
    rejectUser,
    updateUserDetails,
    getAllUsers,
    deleteUser
} = require('../controllers/approvalController');

// Get all pending registration requests
router.get('/pending', protect, admin, getPendingUsers);

// Get pending count (lightweight endpoint for polling)
router.get('/count', protect, admin, getPendingCount);

// Get all approved users
router.get('/users', protect, admin, getAllUsers);

// Approve user
router.put('/:id/approve', protect, admin, approveUser);

// Reject user
router.put('/:id/reject', protect, admin, rejectUser);

// Update user details
router.put('/:id/update', protect, admin, updateUserDetails);

// Delete user
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
