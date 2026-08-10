const { Verification } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');

const generateOTP = () => {
  // Generate random 6-digit numeric string
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (phoneNumber, email, code, type) => {
  // Stub Twilio / Nodemailer sending. In real life, import credentials and call API.
  logger.info(`[MOCK OTP SERVICE] OTP Code: ${code} sent to Phone: ${phoneNumber} | Email: ${email || 'N/A'} for type: ${type}`);
  return true;
};

const verifyOTP = async (phoneNumber, code, type) => {
  const record = await Verification.findOne({
    where: {
      phoneNumber,
      otpCode: code,
      otpType: type,
      isUsed: false,
      expiresAt: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!record) {
    // If not found, increment attempts on any active code for the number
    const activeOTP = await Verification.findOne({
      where: {
        phoneNumber,
        otpType: type,
        isUsed: false
      }
    });
    if (activeOTP) {
      await activeOTP.increment('attempts');
    }
    return false;
  }

  // Mark code as used
  record.isUsed = true;
  await record.save();
  return true;
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP
};
