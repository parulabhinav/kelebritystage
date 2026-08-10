module.exports = {
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_mock',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_mock',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock'
};
