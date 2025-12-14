const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createFee,
    getFees,
    markPaid,
    createCheckoutSession,
    handlePaymentSuccess
} = require('../controllers/feeController');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/payment-success', protect, handlePaymentSuccess);

router.route('/')
    .post(protect, createFee) // Add admin check
    .get(protect, getFees);

router.route('/:id/pay')
    .put(protect, markPaid); // Add admin check

module.exports = router;
