const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Class = require('./models/Class');

const subjects = [
    { name: 'Physics', code: 'PHY101' },
    { name: 'Chemistry', code: 'CHM101' },
    { name: 'Biology', code: 'BIO101' },
    { name: 'Maths', code: 'MTH101' },
    { name: 'English', code: 'ENG101' }
];

const classes = [
    { name: 'Class 9', section: 'A' },
    { name: 'Class 10', section: 'A' }
];

mongoose.connect('mongodb://localhost:27017/coaching-institute')
    .then(async () => {
        console.log('Connected to MongoDB');

        // Clean and Seed Subjects
        await Subject.deleteMany({});
        const seededSubjects = await Subject.insertMany(subjects);
        console.log('Seeded Subjects:', seededSubjects.map(s => s.name));

        // Clean and Seed Classes
        await Class.deleteMany({});
        const seededClasses = await Class.insertMany(classes);
        console.log('Seeded Classes:', seededClasses.map(c => c.name));

        console.log('Seeding complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Seeding error:', err);
        process.exit(1);
    });
