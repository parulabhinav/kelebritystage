module.exports = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || 'ACmock_sid',
  authToken: process.env.TWILIO_AUTH_TOKEN || 'mock_token',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+1234567890'
};
