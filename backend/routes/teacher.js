const express = require('express');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Get teacher profile with assigned subjects/batches
router.get('/me', auth, roleAuth('teacher'), async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ userId: req.user.id })
            .populate('subjects', 'name')
            .populate('batches', 'name')
            .populate('classes', 'name');

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher profile not found' });
        }
        res.json(teacher);
    } catch (err) {
        console.error('Error fetching teacher profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get students for a specific class (only if assigned to teacher)
router.get('/classes/:classId/students', auth, roleAuth('teacher'), async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ userId: req.user.id });

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher profile not found' });
        }

        // Check if class is assigned to teacher
        if (!teacher.classes.map(c => c.toString()).includes(req.params.classId)) {
            return res.status(403).json({ message: 'Access denied: Class not assigned to you' });
        }

        const students = await Student.find({ classId: req.params.classId })
            .populate('userId', 'name email profilePhoto')
            .select('name userId classId batchId');

        res.json(students);
    } catch (err) {
        console.error('Error fetching class students:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
