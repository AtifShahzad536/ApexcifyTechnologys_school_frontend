const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createMaterial,
    getMaterials,
    deleteMaterial
} = require('../controllers/materialController');

router.route('/')
    .post(protect, createMaterial)
    .get(protect, getMaterials);

router.route('/:id')
    .delete(protect, deleteMaterial);

module.exports = router;
