const { cloudfrontDomain, bucketName } = require('../config/aws');
const { logger } = require('../utils/logger');

const uploadFile = async (file, folder = 'media') => {
  try {
    if (!file) return null;
    
    // Simulate S3 upload latency and returns a CDN/S3 URL
    const fileName = `${Date.now()}_${file.originalname || 'file.jpg'}`;
    const url = `${cloudfrontDomain}/${folder}/${fileName}`;
    
    logger.info(`[MOCK AWS S3] File ${file.originalname} uploaded to S3 bucket ${bucketName} as ${fileName}. URL: ${url}`);
    return url;
  } catch (error) {
    logger.error(`Media upload error: ${error.message}`);
    throw error;
  }
};

const deleteFile = async (fileUrl) => {
  try {
    logger.info(`[MOCK AWS S3] File at URL ${fileUrl} deleted from S3.`);
    return true;
  } catch (error) {
    logger.error(`Media deletion error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  uploadFile,
  deleteFile
};
