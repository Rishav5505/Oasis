const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coaching-institute');
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash('admin123', salt);
  const u = await User.findOneAndUpdate({ email: 'admin@oasis.com' }, { password: hashed }, { new: true });
  console.log('Updated:', u ? u.email : 'not found');
  process.exit();
}

run().catch(e => { console.error(e); process.exit(1); });
