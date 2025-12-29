const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedDB = async () => {
  await mongoose.connect('mongodb://localhost:27017/coaching-institute');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  const admin = new User({
    name: 'Admin',
    email: 'admin@oasis.com',
    phone: '1234567890',
    password: hashedPassword,
    role: 'admin'
  });

  await admin.save();
  console.log('Admin user created');
  process.exit();
};

seedDB();