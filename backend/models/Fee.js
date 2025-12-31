const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  totalFees: { type: Number, required: true },
  paidFees: { type: Number, default: 0 },
  pendingFees: { type: Number, default: 0 },
  payments: [{
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    mode: { type: String, default: 'online' },
    transactionId: { type: String },
    remarks: { type: String }
  }],
  dueDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);