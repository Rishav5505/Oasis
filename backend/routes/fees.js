const express = require('express');
const Fee = require('../models/Fee');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const User = require('../models/User'); // Import User model to be safe
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Add new fee payment
router.post('/pay', auth, roleAuth('admin'), async (req, res) => {
    try {
        const { studentId, amount, type, transactionId, remarks } = req.body;

        const fee = new Fee({
            studentId, // Ensure this is the STUDENT Schema ID, not User ID, based on frontend
            amount,
            type,
            transactionId,
            remarks,
            status: 'Paid'
        });

        await fee.save();

        // Find Student Profile to get User ID and Parent ID
        const studentProfile = await Student.findById(studentId);

        if (studentProfile) {
            // Create Notification for Student
            await new Notification({
                recipient: studentProfile.userId,
                title: 'Fee Payment Received',
                message: `We have received a payment of ₹${amount} for ${type}. Transaction ID: ${transactionId || 'N/A'}. You can download the receipt from your dashboard.`,
                type: 'fee'
            }).save();

            // Create Notification for Parent (if linked)
            if (studentProfile.parentId) {
                await new Notification({
                    recipient: studentProfile.parentId,
                    title: 'Fee Payment Confirmation',
                    message: `Payment of ₹${amount} received for your ward ${studentProfile.name}. You can download the receipt from your dashboard.`,
                    type: 'fee'
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
        // Populate Student details (name, fatherNam, etc.)
        // Note: studentId in Fee model currently refers to 'User' based on model def, but frontend sends Student ID.
        // I need to update Fee model ref to 'Student' or populate correctly.
        // Assuming I update Fee model ref to 'Student' in next step or use deep populate.
        // Let's assume Fee.studentId is ref 'Student'.
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
            try {
                student = await Student.findById(idParam);
            } catch (e) { }
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

// Get Fee Stats (Total Collection)
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
