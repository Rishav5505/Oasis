const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Register all models to avoid populate errors
require('./models/User');
require('./models/Student');
require('./models/Teacher');
require('./models/Class');
require('./models/Batch');
require('./models/Subject');
require('./models/Attendance');
require('./models/Marks');
require('./models/Exam');
require('./models/Fee');
require('./models/Notice');
require('./models/StudyMaterial');
require('./models/Otp');
require('./models/Lead');
require('./models/Notification');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coaching-institute', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/marks', require('./routes/marks'));
app.use('/api/study-material', require('./routes/studyMaterial'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/attendance/teacher', require('./routes/teacherAttendance')); // New route for teacher attendance
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/public', require('./routes/public'));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));