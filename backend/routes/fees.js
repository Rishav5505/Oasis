const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_eYqCAnN83D89mB',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret'
});

// Create Razorpay Order
router.post('/razorpay/order', auth, roleAuth('parent'), async (req, res) => {
    const { amount } = req.body;
    try {
        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error('Razorpay Order Error:', err);
        res.status(500).json({ message: 'Error creating Razorpay order' });
    }
});

// Verify Razorpay Payment
router.post('/razorpay/verify', auth, roleAuth('parent'), async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId, amount } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'test_secret')
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        try {
            const paymentAmount = Number(amount);

            // Create a new Transaction record
            const fee = new Fee({
                studentId,
                amount: paymentAmount,
                mode: 'Razorpay',
                transactionId: razorpay_payment_id,
                type: 'Online Payment',
                status: 'Paid'
            });

            await fee.save();

            // Find Student Profile for notifications
            const studentProfile = await Student.findById(studentId);
            if (studentProfile) {
                await new Notification({
                    userId: studentProfile.userId,
                    title: 'Fee Payment Received',
                    message: `Payment of ₹${paymentAmount} received via Razorpay. Transaction ID: ${razorpay_payment_id}.`,
                    type: 'payment'
                }).save();

                if (studentProfile.parentId) {
                    await new Notification({
                        userId: studentProfile.parentId,
                        title: 'Fee Payment Confirmation',
                        message: `Payment of ₹${paymentAmount} confirmed for child ${studentProfile.name}.`,
                        type: 'payment'
                    }).save();
                }
            }

            res.json({ message: 'Payment verified and recorded', fee });
        } catch (err) {
            console.error('Verification Save Error:', err);
            res.status(500).json({ message: 'Payment verified but failed to update record' });
        }
    } else {
        res.status(400).json({ message: 'Invalid signature' });
    }
});

// Add new fee payment (Admin Only)
router.post('/pay', auth, roleAuth('admin'), async (req, res) => {
    try {
        const { studentId, amount, type, transactionId, remarks, mode } = req.body;

        const fee = new Fee({
            studentId,
            amount,
            type: type || 'Direct Payment',
            transactionId,
            remarks,
            mode: mode || 'Cash',
            status: 'Paid'
        });

        await fee.save();

        const studentProfile = await Student.findById(studentId);
        if (studentProfile) {
            await new Notification({
                userId: studentProfile.userId,
                title: 'Fee Payment Received',
                message: `We have received a payment of ₹${amount} for ${type || 'fees'}.`,
                type: 'payment'
            }).save();

            if (studentProfile.parentId) {
                await new Notification({
                    userId: studentProfile.parentId,
                    title: 'Fee Payment Confirmation',
                    message: `Payment of ₹${amount} received for ${studentProfile.name}.`,
                    type: 'payment'
                }).save();
            }
        }

        res.json(fee);
    } catch (err) {
        console.error('Error adding fee:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all fee records (Admin)
router.get('/all', auth, roleAuth('admin'), async (req, res) => {
    try {
        const fees = await Fee.find()
            .populate('studentId', 'name fatherName totalFee')
            .sort({ date: -1 });
        res.json(fees);
    } catch (err) {
        console.error('Error fetching fees:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get fees for a specific student (Admin or Student/Parent)
router.get('/student/:id', auth, async (req, res) => {
    try {
        const idParam = req.params.id;

        let student = null;
        if (idParam.match(/^[0-9a-fA-F]{24}$/)) {
            student = await Student.findById(idParam);
        }

        if (!student && idParam.match(/^[0-9a-fA-F]{24}$/)) {
            student = await Student.findOne({ userId: idParam });
        }

        if (!student) {
            return res.status(404).json({ message: 'Student record not found' });
        }

        const fees = await Fee.find({ studentId: student._id }).sort({ date: -1 });

        const totalFees = student.totalFee || 0;
        const paidFees = fees.reduce((acc, curr) => acc + curr.amount, 0);
        const pendingFees = totalFees - paidFees;

        res.json({
            totalFees,
            paidFees,
            pendingFees: pendingFees > 0 ? pendingFees : 0,
            payments: fees,
            dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        });
    } catch (err) {
        console.error('Error fetching student fees:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Fee Stats (Admin)
router.get('/stats', auth, roleAuth('admin'), async (req, res) => {
    try {
        const fees = await Fee.find({ status: 'Paid' });
        const totalCollection = fees.reduce((acc, curr) => acc + curr.amount, 0);
        res.json({ totalCollection });
    } catch (err) {
        console.error('Error fetching fee stats:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
