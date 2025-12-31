const mongoose = require('mongoose');
const TeacherAttendance = require('./models/TeacherAttendance');
const User = require('./models/User');
require('dotenv').config();

const checkAttendance = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coaching-institute');
        console.log('MongoDB connected');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log('Checking for date:', today.toISOString());

        // Find ALL records for today to be sure
        const records = await TeacherAttendance.find({ date: today });
        console.log(`Found ${records.length} records for today.`);

        records.forEach(r => {
            console.log(`ID: ${r._id}`);
            console.log(`TeacherId: ${r.teacherId}`);
            console.log(`ClassName: "${r.className}"`);
            console.log(`Date: ${r.date}`);
            console.log('-------------------');
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAttendance();
