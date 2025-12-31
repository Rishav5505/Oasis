const mongoose = require('mongoose');
const Exam = require('./models/Exam');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
require('dotenv').config();

const seedExams = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coaching-institute');
        console.log('Connected to MongoDB');

        // Get existing classes and subjects
        const classes = await Class.find();
        const subjects = await Subject.find();

        if (classes.length === 0 || subjects.length === 0) {
            console.log('⚠️  Please seed classes and subjects first using seedCoaching.js');
            process.exit(1);
        }

        // Clear existing exams
        await Exam.deleteMany({});
        console.log('Cleared existing exams');

        // Create sample exams for each class
        const exams = [];

        for (const cls of classes) {
            // Unit Tests
            exams.push({
                name: 'Unit Test 1',
                type: 'unit',
                classId: cls._id,
                date: new Date('2024-01-15'),
                subjects: subjects.map(s => s._id)
            });

            exams.push({
                name: 'Unit Test 2',
                type: 'unit',
                classId: cls._id,
                date: new Date('2024-02-15'),
                subjects: subjects.map(s => s._id)
            });

            exams.push({
                name: 'Unit Test 3',
                type: 'unit',
                classId: cls._id,
                date: new Date('2024-03-15'),
                subjects: subjects.map(s => s._id)
            });

            // Monthly Tests
            exams.push({
                name: 'Monthly Test - January',
                type: 'monthly',
                classId: cls._id,
                date: new Date('2024-01-25'),
                subjects: subjects.map(s => s._id)
            });

            exams.push({
                name: 'Monthly Test - February',
                type: 'monthly',
                classId: cls._id,
                date: new Date('2024-02-25'),
                subjects: subjects.map(s => s._id)
            });

            exams.push({
                name: 'Monthly Test - March',
                type: 'monthly',
                classId: cls._id,
                date: new Date('2024-03-25'),
                subjects: subjects.map(s => s._id)
            });

            // Final Exams
            exams.push({
                name: 'Mid-Term Examination',
                type: 'final',
                classId: cls._id,
                date: new Date('2024-04-10'),
                subjects: subjects.map(s => s._id)
            });

            exams.push({
                name: 'Final Examination',
                type: 'final',
                classId: cls._id,
                date: new Date('2024-06-15'),
                subjects: subjects.map(s => s._id)
            });
        }

        // Insert all exams
        const createdExams = await Exam.insertMany(exams);
        console.log(`✅ Created ${createdExams.length} exams successfully!`);

        // Display summary
        console.log('\n📊 Exam Summary:');
        console.log(`   Unit Tests: ${exams.filter(e => e.type === 'unit').length}`);
        console.log(`   Monthly Tests: ${exams.filter(e => e.type === 'monthly').length}`);
        console.log(`   Final Exams: ${exams.filter(e => e.type === 'final').length}`);
        console.log(`   Total: ${createdExams.length}`);

        process.exit(0);
    } catch (err) {
        console.error('Error seeding exams:', err);
        process.exit(1);
    }
};

seedExams();
