const mongoose = require('mongoose');

const teacherAttendanceSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'leave'], required: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    className: { type: String }, // Class for which attendance is marked
    remarks: { type: String }
}, { timestamps: true });

// Compound index to ensure one record per teacher per class per day
teacherAttendanceSchema.index({ teacherId: 1, date: 1, className: 1 }, { unique: true });

module.exports = mongoose.model('TeacherAttendance', teacherAttendanceSchema);
