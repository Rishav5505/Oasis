const mongoose = require('mongoose');
const Exam = require('./backend/models/Exam');
const Class = require('./backend/models/Class');
const Subject = require('./backend/models/Subject');

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
                        name: 'First Term',
                        type: 'unit',
                        date: new Date(),
                        classId: classes[0]._id,
                        subjects: subjects.slice(0, 3).map(s => s._id)
                    },
                    {
                        name: 'Mid Term',
                        type: 'monthly',
                        date: new Date(),
                        classId: classes[1] ? classes[1]._id : classes[0]._id,
                        subjects: subjects.slice(0, 5).map(s => s._id)
                    }
                ];
                await Exam.insertMany(exams);
                console.log('Seeded 2 exams');
            } else {
                console.log('No classes found to link exams to.');
            }
        }
        process.exit(0);
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
