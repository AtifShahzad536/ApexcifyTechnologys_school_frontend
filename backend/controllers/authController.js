const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendNewApprovalNotification } = require('../utils/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // Check if user is approved
        if (user.status === 'Pending') {
            return res.status(403).json({
                message: 'Your account is pending admin approval. Please check back later.'
            });
        }

        if (user.status === 'Rejected') {
            return res.status(403).json({
                message: 'Your registration request was rejected. Please contact admin for more information.'
            });
        }

        // Only approved users can login
        if (user.status === 'Approved') {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(403).json({ message: 'Account access denied' });
        }
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        // Check if it's a pending request within 12 hours
        if (userExists.status === 'Pending') {
            const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
            if (userExists.requestedAt >= twelveHoursAgo) {
                return res.status(400).json({
                    message: 'Registration request already submitted. Please wait for admin approval (up to 12 hours).'
                });
            }
        } else {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
    }

    // Create user with Pending status (role will be assigned by admin)
    const user = await User.create({
        name,
        email,
        password,
        status: 'Pending',
        requestedAt: new Date()
    });

    if (user) {
        // Send email notification to admin (non-blocking)
        sendNewApprovalNotification({
            name: user.name,
            email: user.email,
            requestedAt: user.requestedAt
        }).catch(err => {
            // Log error but don't block registration
            console.error('Failed to send email notification:', err);
        });

        res.status(201).json({
            message: 'Registration submitted successfully! Your account is pending admin approval. You will be able to login once approved.',
            email: user.email,
            name: user.name,
            status: user.status
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

module.exports = { loginUser, registerUser };
