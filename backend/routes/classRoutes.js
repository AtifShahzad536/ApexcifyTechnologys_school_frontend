const express = require('express');
const router = express.Router();
const { createClass, getClasses, deleteClass } = require('../controllers/classController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, createClass)
    .get(protect, getClasses);

router.route('/:id')
    .delete(protect, admin, deleteClass);

module.exports = router;
