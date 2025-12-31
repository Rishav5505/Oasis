const express = require('express');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');

const router = express.Router();

// Bulk mark attendance (teacher only)
router.post('/bulk', auth, roleAuth('teacher'), async (req, res) => {
  const { students, date, subjectId } = req.body;
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const promises = students.map(async (s) => {
      const attendance = await Attendance.findOneAndUpdate(
        { studentId: s.studentId, date: startOfDay, subjectId },
        { status: s.status, markedBy: req.user.id },
        { upsert: true, new: true }
      );

      if (s.status === 'absent') {
        const student = await Student.findById(s.studentId).populate('parentId');
        if (student && student.parentId) {
          const parentId = student.parentId._id || student.parentId;
          const subject = await require('../models/Subject').findById(subjectId);
          const message = `Dear Parent, your child ${student.name} was absent in ${subject ? subject.name : 'Class'} on ${date}.`;

          const notification = new Notification({
            recipient: parentId,
            title: 'Attendance Alert',
            message: message,
            type: 'academic'
          });
          await notification.save();
        }
      }
      return attendance;
    });

    await Promise.all(promises);
    res.json({ message: 'Bulk attendance updated' });
  } catch (err) {
    console.error('Bulk attendance error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark attendance (teacher only)
router.post('/', auth, roleAuth('teacher'), async (req, res) => {
  const { studentId, date, status, subjectId } = req.body;
  try {
    // Normalize date to start of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { studentId, date: startOfDay, subjectId },
      { status, markedBy: req.user.id },
      { upsert: true, new: true }
    );

    if (status === 'absent') {
      const student = await Student.findById(studentId).populate('parentId');
      if (student.parentId) {
        const parentId = student.parentId._id || student.parentId;
        const subject = await require('../models/Subject').findById(subjectId);
        const message = `Dear Parent, your child ${student.name} was absent in ${subject ? subject.name : 'Class'} on ${date}.`;

        // Existing Email/SMS
        const parentUser = await User.findById(parentId);
        if (parentUser) {
          sendEmail(parentUser.email, 'Attendance Notification', message);
          // sendSMS(parentUser.phone, message);
        }

        // New In-App Notification
        const notification = new Notification({
          recipient: parentId,
          title: 'Daily Attendance Alert',
          message: message,
          type: 'academic'
        });
        await notification.save();
      }
    }

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance for student (student/parent/teacher/admin)
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    let student = await Student.findById(req.params.studentId);
    if (!student) {
      student = await Student.findOne({ userId: req.params.studentId });
    }
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (req.user.role === 'student' && req.user.id !== student.userId.toString()) return res.status(403).json({ message: 'Access denied' });
    if (req.user.role === 'parent') {
      // Parents can only access their linked student's data via token
      if (!req.user.studentId || req.user.studentId !== student._id.toString()) {
        return res.status(403).json({ message: 'Access denied. Can only view own child\'s data.' });
      }
    }
    // Teacher and admin can view

    const attendance = await Attendance.find({ studentId: student._id });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all attendance (admin)
router.get('/', auth, roleAuth('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.find().populate('studentId').populate('markedBy');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance for a class, subject, and date
router.get('/class/:classId/subject/:subjectId/date/:date', auth, async (req, res) => {
  const { classId, subjectId, date } = req.params;
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const students = await Student.find({ classId });
    const studentIds = students.map(s => s._id);

    const attendance = await Attendance.find({
      studentId: { $in: studentIds },
      subjectId,
      date: startOfDay
    });

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;