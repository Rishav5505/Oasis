const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 10th, 11th
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);