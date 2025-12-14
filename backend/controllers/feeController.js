const Fee = require('../models/Fee');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create Invoices (Bulk or Single)
// @route   POST /api/fees
// @access  Admin
const createFee = async (req, res) => {
    try {
        const { studentId, classId, amount, month, dueDate, type } = req.body;

        if (classId) {
            // Bulk create for class
            const students = await User.find({ studentClass: classId, role: 'Student' });
            if (students.length === 0) return res.status(404).json({ message: 'No students found in class' });

            const fees = students.map(student => ({
                student: student._id,
                amount,
                month,
                dueDate,
                type,
                status: 'Pending'
            }));

            await Fee.insertMany(fees);
            return res.status(201).json({ message: `Invoices created for ${students.length} students` });
        }

        if (studentId) {
            // Single student
            const fee = await Fee.create({
                student: studentId,
                amount,
                month,
                dueDate,
                type
            });
            return res.status(201).json(fee);
        }

        res.status(400).json({ message: 'Provide studentId or classId' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Fees
// @route   GET /api/fees
// @access  Private
const getFees = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'Student') {
            query.student = req.user._id;
        } else if (req.user.role === 'Parent') {
            // Find children from parent's children array (more reliable source of truth)
            const parentUser = await User.findById(req.user._id);
            const childIds = parentUser.children;
            query.student = { $in: childIds };
        }
        // Admin sees all by default from query params filtering (not implemented fully here, returns all)

        const fees = await Fee.find(query)
            .populate('student', 'name email studentClass')
            .sort({ dueDate: 1 });

        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark as Paid
// @route   PUT /api/fees/:id/pay
// @access  Admin
const markPaid = async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id);
        if (!fee) return res.status(404).json({ message: 'Invoice not found' });

        fee.status = 'Paid';
        fee.paidAt = Date.now();
        await fee.save();

        res.json(fee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create Checkout Session
// @route   POST /api/fees/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
    try {
        const { feeId } = req.body;
        const fee = await Fee.findById(feeId).populate('student');

        if (!fee) return res.status(404).json({ message: 'Fee not found' });
        if (fee.status === 'Paid') return res.status(400).json({ message: 'Fee already paid' });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${fee.type} - ${fee.month}`,
                            description: `Fee for ${fee.student.name}`,
                        },
                        unit_amount: fee.amount * 100, // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}&fee_id=${fee._id}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/parent/fees`,
            customer_email: fee.student.email,
            metadata: {
                feeId: fee._id.toString()
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Payment Success
// @route   POST /api/fees/payment-success
// @access  Private
const handlePaymentSuccess = async (req, res) => {
    try {
        const { session_id, feeId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            const fee = await Fee.findById(feeId);
            if (fee) {
                fee.status = 'Paid';
                fee.paidAt = Date.now();
                fee.paymentIntentId = session.payment_intent;
                await fee.save();
                res.json({ success: true });
            } else {
                res.status(404).json({ message: 'Fee not found' });
            }
        } else {
            res.status(400).json({ message: 'Payment not successful' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createFee,
    getFees,
    markPaid,
    createCheckoutSession,
    handlePaymentSuccess
};
