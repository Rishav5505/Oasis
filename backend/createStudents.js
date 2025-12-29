const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');

const createStudents = async () => {
  await mongoose.connect('mongodb://localhost:27017/coaching-institute');

  const students = await User.find({ role: 'student' });
  for (const user of students) {
    const existing = await Student.findOne({ userId: user._id });
    if (!existing) {
      const student = new Student({
        userId: user._id,
        name: user.name,
        classId: null, // Set as needed
        batchId: null,
      });
      await student.save();
      console.log('Created student for', user.name);
    }
  }

  console.log('Done');
  process.exit();
};

createStudents();