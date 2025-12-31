const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['Tuition', 'Exam', 'Registration', 'Other'], default: 'Tuition' },
  status: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
  transactionId: { type: String },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);