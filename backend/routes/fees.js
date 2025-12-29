const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Get fees for a student
router.get('/student/:studentId', auth, async (req, res) => {
    try {
        let student = await Student.findById(req.params.studentId);
        if (!student) {
            student = await Student.findOne({ userId: req.params.studentId });
        }
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const fee = await Fee.findOne({ studentId: student._id }).populate('studentId');
        if (!fee) {
            return res.json({ totalFees: 0, paidFees: 0, pendingFees: 0, payments: [] });
        }
        res.json(fee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create or update fee record (admin/teacher only)
router.post('/', auth, roleAuth(['admin', 'teacher']), async (req, res) => {
    try {
        const { studentId, totalFees, paidFees, pendingFees, payments, dueDate } = req.body;
        let fee = await Fee.findOne({ studentId });
        if (fee) {
            fee.totalFees = totalFees || fee.totalFees;
            fee.paidFees = paidFees || fee.paidFees;
            fee.pendingFees = pendingFees || fee.pendingFees;
            if (payments) fee.payments.push(...payments);
            fee.dueDate = dueDate || fee.dueDate;
            await fee.save();
        } else {
            fee = new Fee({ studentId, totalFees, paidFees, pendingFees, payments, dueDate });
            await fee.save();
        }
        res.status(201).json(fee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Online Payment (Parent only) - Simulated
router.post('/pay', auth, roleAuth('parent'), async (req, res) => {
    const { studentId, amount, paymentMethod } = req.body;
    try {
        let fee = await Fee.findOne({ studentId });
        if (!fee) return res.status(404).json({ message: 'Fee record not found' });

        const paymentAmount = Number(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            return res.status(400).json({ message: 'Invalid payment amount' });
        }

        fee.paidFees += paymentAmount;
        fee.pendingFees = Math.max(0, fee.pendingFees - paymentAmount);

        fee.payments.push({
            amount: paymentAmount,
            date: new Date(),
            mode: paymentMethod || 'Online'
        });

        await fee.save();
        res.json({ message: 'Payment successful', fee });
    } catch (err) {
        console.error('Payment Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
