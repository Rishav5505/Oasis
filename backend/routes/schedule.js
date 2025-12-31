const express = require('express');
const Schedule = require('../models/Schedule');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const router = express.Router();

// Get schedule for a student (via their batch)
router.get('/student/:studentId', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const batchId = student.batchId;
        if (!batchId) return res.status(404).json({ message: 'No batch assigned to student' });

        const schedule = await Schedule.find({ batchId })
            .populate('subjectId', 'name')
            .populate('teacherId', 'name');

        res.json(schedule);
    } catch (err) {
        console.error('Schedule Fetch Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
