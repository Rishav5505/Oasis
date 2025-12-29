const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  totalFees: { type: Number, required: true },
  paidFees: { type: Number, default: 0 },
  pendingFees: { type: Number, default: 0 },
  payments: [{
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    mode: { type: String, enum: ['cash', 'online', 'cheque'], default: 'cash' },
    receipt: { type: String } // receipt number or file
  }],
  dueDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);