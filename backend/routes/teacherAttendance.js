const express = require('express');
const TeacherAttendance = require('../models/TeacherAttendance');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Mark attendance (Teacher only)
router.post('/mark', auth, roleAuth('teacher'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { status, remarks, className } = req.body;

        // Check if already marked for today for this specific class
        let attendance = await TeacherAttendance.findOne({
            teacherId: req.user.id,
            date: today,
            className: className || 'General' // Default to 'General' if no class specified
        });

        if (attendance) {
            return res.status(400).json({ message: `Attendance already marked for ${className || 'General'} today` });
        }

        attendance = new TeacherAttendance({
            teacherId: req.user.id,
            date: today,
            status: status || 'present',
            checkInTime: new Date(),
            className: className || 'General',
            remarks
        });

        await attendance.save();
        res.json(attendance);
    } catch (err) {
        console.error('Error marking teacher attendance:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get my attendance (Teacher only)
router.get('/me', auth, roleAuth('teacher'), async (req, res) => {
    try {
        const attendance = await TeacherAttendance.find({ teacherId: req.user.id }).sort({ date: -1 });
        res.json(attendance);
    } catch (err) {
        console.error('Error fetching teacher attendance:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Check status for today (Teacher only)
router.get('/today', auth, roleAuth('teacher'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendanceList = await TeacherAttendance.find({ teacherId: req.user.id, date: today });
        res.json({ marked: attendanceList.length > 0, data: attendanceList });
    } catch (err) {
        console.error('Error checking today status:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all detailed attendance (Admin only)
router.get('/all', auth, roleAuth('admin'), async (req, res) => {
    try {
        const attendance = await TeacherAttendance.find().populate('teacherId', 'name email phone').sort({ date: -1 });
        res.json(attendance);
    } catch (err) {
        console.error('Error fetching all teacher attendance:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
