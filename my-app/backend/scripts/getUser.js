const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coaching-institute');
  const user = await User.findOne({ email: 'admin@oasis.com' }).lean();
  console.log(user);
  process.exit();
}

run().catch(e => { console.error(e); process.exit(1); });
