const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const cloudinary = require('cloudinary').v2;
const awsConfig = require('../config/aws');
const { logger } = require('../utils/logger');

// Configure Cloudinary if keys are provided in .env
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  logger.info('Cloudinary initialized for media storage.');
}

// Configure AWS S3 Client
let s3Client = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'mock') {
  s3Client = new S3Client({
    region: awsConfig.region,
    credentials: {
      accessKeyId: awsConfig.credentials.accessKeyId,
      secretAccessKey: awsConfig.credentials.secretAccessKey
    }
  });
  logger.info('AWS S3 client initialized for media storage.');
}

const uploadFile = async (file, folder = 'media') => {
  try {
    if (!file) return null;
    
    const fileExtension = file.originalname ? file.originalname.split('.').pop() : 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

    // --- 1. Cloudinary Storage (Development / Testing) ---
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `book-my-celeb/${folder}`,
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) {
              logger.error(`Cloudinary upload failed: ${error.message}`);
              return reject(error);
            }
            logger.info(`[CLOUDINARY] Uploaded ${file.originalname} -> ${result.secure_url}`);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });
    }

    // --- 2. AWS S3 Storage (Production) ---
    if (s3Client) {
      const s3Key = `${folder}/${fileName}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: awsConfig.bucketName,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype
        })
      );
      
      const url = `${awsConfig.cloudfrontDomain}/${s3Key}`;
      logger.info(`[AWS S3] Uploaded ${file.originalname} to bucket ${awsConfig.bucketName} -> ${url}`);
      return url;
    }

    // --- 3. Mock Fallback (Default Local Dev fallback if keys aren't set yet) ---
    const fallbackUrl = `https://mock-storage.com/${folder}/${fileName}`;
    logger.info(`[MOCK STORAGE] (No Cloudinary/S3 keys set) Simulating upload: ${file.originalname} -> ${fallbackUrl}`);
    return fallbackUrl;
  } catch (error) {
    logger.error(`Media upload error: ${error.message}`);
    throw error;
  }
};

const deleteFile = async (fileUrl) => {
  try {
      if (process.env.CLOUDINARY_CLOUD_NAME && fileUrl.includes('cloudinary.com')) {
      // Extract public ID from Cloudinary URL
      const parts = fileUrl.split('/');
      const filename = parts.pop();
      const publicId = `book-my-celeb/${parts.pop()}/${filename.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId);
      logger.info(`[CLOUDINARY] Deleted file with ID: ${publicId}`);
      return true;
    }

    logger.info(`[MEDIA SERVICE] Simulated deletion of ${fileUrl}`);
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
