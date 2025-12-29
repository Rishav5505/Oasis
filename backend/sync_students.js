const mongoose = require('mongoose');
const User = require('./models/User');
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
            const studentUsers = await User.find({ role: 'student' });
            console.log(`Found ${studentUsers.length} student users.`);

            for (const u of studentUsers) {
                const existingStudent = await Student.findOne({ userId: u._id });
                if (!existingStudent) {
                    const student = new Student({
                        userId: u._id,
                        name: u.name,
                        admissionDate: u.createdAt || new Date(),
                    });
                    await student.save();
                    console.log(`Created Student record for: ${u.name} (${u._id})`);
                } else {
                    console.log(`Student record already exists for: ${u.name}`);
                }
            }
            console.log('Sync complete.');
        } catch (err) {
            console.error(err);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch(err => console.log(err));
