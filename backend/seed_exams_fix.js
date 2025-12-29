const mongoose = require('mongoose');
const Exam = require('./models/Exam');
const Class = require('./models/Class');
const Subject = require('./models/Subject');

mongoose.connect('mongodb://localhost:27017/coaching-institute')
    .then(async () => {
        const count = await Exam.countDocuments();
        console.log('Exam count:', count);

        if (count === 0) {
            console.log('Seeding some exams...');
            const classes = await Class.find();
            const subjects = await Subject.find();

            if (classes.length > 0) {
                const exams = [
                    {
                        name: 'Unit Test 1',
                        type: 'unit',
                        date: new Date(),
                        classId: classes[0]._id,
                        subjects: subjects.map(s => s._id)
                    },
                    {
                        name: 'Monthly Test',
                        type: 'monthly',
                        date: new Date(),
                        classId: classes[1] ? classes[1]._id : classes[0]._id,
                        subjects: subjects.map(s => s._id)
                    },
                    {
                        name: 'Final Term',
                        type: 'final',
                        date: new Date('2026-03-20'),
                        classId: classes[0]._id,
                        subjects: subjects.map(s => s._id)
                    }
                ];
                await Exam.insertMany(exams);
                console.log('Seeded default exams');
            }
        }
        process.exit(0);
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
