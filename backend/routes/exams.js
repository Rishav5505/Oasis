const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Get all exams
router.get('/', auth, async (req, res) => {
  try {
    const exams = await Exam.find().populate('classId').populate('subjects');
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get exams for a class
router.get('/class/:classId', auth, async (req, res) => {
  try {
    const exams = await Exam.find({ classId: req.params.classId }).populate('subjects');
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create exam (admin/teacher only)
router.post('/', auth, roleAuth(['admin', 'teacher']), async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;