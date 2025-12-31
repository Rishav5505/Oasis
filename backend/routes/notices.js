const express = require('express');
const Notice = require('../models/Notice');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const User = require('../models/User');
const Notification = require('../models/Notification');
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

    // Broadcast notification to target users
    if (targetRoles && targetRoles.length > 0) {
      const users = await User.find({ role: { $in: targetRoles } });
      const notifications = users.map(user => ({
        recipient: user._id,
        title: `New Notice: ${title}`,
        message: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        type: 'general',
        read: false
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.json(notice);
  } catch (err) {
    console.error('Error creating notice:', err);
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