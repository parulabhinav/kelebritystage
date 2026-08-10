module.exports = {
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock'
  },
  bucketName: process.env.AWS_S3_BUCKET || 'celebrity-booking-media',
  cloudfrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN || 'https://mock-cloudfront-url.com'
};
