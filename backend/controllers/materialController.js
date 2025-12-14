const Material = require('../models/Material');

// @desc    Upload/Create a new material
// @route   POST /api/materials
// @access  Teacher
const createMaterial = async (req, res) => {
    try {
        const { title, description, subject, class: classId, type, link } = req.body;

        const material = await Material.create({
            title,
            description,
            subject,
            class: classId,
            type,
            link,
            uploadedBy: req.user._id
        });

        const populatedMaterial = await Material.findById(material._id)
            .populate('subject', 'name')
            .populate('class', 'name section')
            .populate('uploadedBy', 'name');

        res.status(201).json(populatedMaterial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get materials by class and subject
// @route   GET /api/materials
// @access  Private
const getMaterials = async (req, res) => {
    try {
        const { classId, subjectId } = req.query;
        let query = {};

        if (classId) query.class = classId;
        if (subjectId) query.subject = subjectId;

        const materials = await Material.find(query)
            .populate('subject', 'name')
            .populate('class', 'name section')
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Teacher
const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Verify ownership
        if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await material.deleteOne();
        res.json({ message: 'Material removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createMaterial,
    getMaterials,
    deleteMaterial
};
