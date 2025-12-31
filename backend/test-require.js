const fs = require('fs');
const path = require('path');

const filesToTest = [
    './models/User',
    './models/Student',
    './models/Teacher',
    './models/Class',
    './models/Batch',
    './models/Subject',
    './models/Attendance',
    './models/Marks',
    './models/Exam',
    './models/Fee',
    './models/Notice',
    './models/StudyMaterial',
    './models/Otp',
    './models/Lead',
    './models/Notification',
    './models/Schedule',
    './routes/auth',
    './routes/users',
    './routes/attendance',
    './routes/marks',
    './routes/studyMaterial',
    './routes/fees',
    './routes/exams',
    './routes/notices',
    './routes/notifications',
    './routes/teacherAttendance',
    './routes/teacher',
    './routes/leads',
    './routes/public',
    './routes/schedule'
];

filesToTest.forEach(file => {
    try {
        console.log(`Requiring ${file}...`);
        require(file);
        console.log(`Success: ${file}`);
    } catch (err) {
        console.error(`FAILED to require ${file}:`);
        console.error(err);
        process.exit(1);
    }
});

console.log('All modules required successfully!');
