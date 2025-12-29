const express = require('express');
const Lead = require('../models/Lead');

const router = express.Router();

// Submit enquiry
router.post('/', async (req, res) => {
  const { name, email, phone, message, course, batchTiming } = req.body;
  try {
    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
    }

    const lead = new Lead({
      name,
      email,
      phone,
      message: message || `Interested in ${course || 'courses'}. Preferred batch: ${batchTiming || 'Any'}`,
      course
    });
    await lead.save();

    console.log('New lead submitted:', { name, email, course, batchTiming });
    res.json({ message: 'Thank you! We will contact you soon for the free demo class.', success: true });
  } catch (err) {
    console.error('Error submitting lead:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;