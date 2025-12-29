const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., Morning, Evening
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  schedule: { type: String }, // e.g., 9AM-12PM
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);