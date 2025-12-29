const crypto = require('crypto');
const Otp = require('../models/Otp');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

async function createAndSaveOtp(userId) {
  const otp = generateOtp();
  const codeHash = hashOtp(otp);
  await Otp.create({ userId, codeHash });
  return otp; // caller should deliver this to user via SMS/email
}

async function verifyOtp(userId, otpCandidate) {
  const codeHash = hashOtp(otpCandidate);
  const record = await Otp.findOne({ userId, codeHash });
  if (!record) return false;
  await Otp.deleteMany({ userId });
  return true;
}

module.exports = { createAndSaveOtp, verifyOtp };
