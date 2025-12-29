const express = require('express');
const Notice = require('../models/Notice');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Create notice (admin)
router.post('/', auth, roleAuth('admin'), async (req, res) => {
  const { title, content, targetRoles } = req.body;
  try {
    const notice = new Notice({
      title,
      content,
      createdBy: req.user.id,
      targetRoles,
    });
    await notice.save();
    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notices for user role
router.get('/', auth, async (req, res) => {
  try {
    const notices = await Notice.find({ targetRoles: req.user.role });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all notices (admin)
router.get('/all', auth, roleAuth('admin'), async (req, res) => {
  try {
    const notices = await Notice.find().populate('createdBy');
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;