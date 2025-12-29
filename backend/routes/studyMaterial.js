const express = require('express');
const multer = require('multer');
const StudyMaterial = require('../models/StudyMaterial');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Upload study material (teacher only)
router.post('/', auth, roleAuth('teacher'), upload.single('file'), async (req, res) => {
  const { title, subjectId } = req.body;
  try {
    const material = new StudyMaterial({
      title,
      subjectId,
      fileUrl: req.file.path,
      uploadedBy: req.user.id,
    });
    await material.save();
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get study materials
router.get('/', auth, async (req, res) => {
  try {
    const materials = await StudyMaterial.find().populate('subjectId');
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;