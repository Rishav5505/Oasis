const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  fatherName: { type: String },
  motherName: { type: String },
  dob: { type: Date },
  admissionDate: { type: Date, default: Date.now },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalFee: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);