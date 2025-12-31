const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('teacherattendances');

        // List indexes
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        // Find the old unique index on teacherId + date (without className)
        const oldIndexName = indexes.find(idx =>
            idx.key.teacherId === 1 &&
            idx.key.date === 1 &&
            !idx.key.className
        )?.name;

        if (oldIndexName) {
            console.log(`Dropping old index: ${oldIndexName}`);
            await collection.dropIndex(oldIndexName);
            console.log('Old index dropped successfully.');
        } else {
            console.log('Old index not found. It might have consistently been replaced or never existed.');
        }

        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixIndexes();
