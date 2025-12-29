const mongoose = require('mongoose');
const Student = require('./models/Student');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coaching-institute', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('Connected to MongoDB');
        try {
            const students = await Student.find({}, 'name email classId batchId');
            console.log('--- ALL STUDENTS IN DB ---');
            students.forEach(s => {
                console.log(`ID: ${s._id}, Name: ${s.name}`);
            });
            console.log(`Total Count: ${students.length}`);
        } catch (err) {
            console.error(err);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch(err => console.log(err));
