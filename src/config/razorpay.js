module.exports = {
  keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
  keySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret',
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret'
};
