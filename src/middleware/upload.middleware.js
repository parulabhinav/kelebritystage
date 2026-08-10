const multer = require('multer');

// Store files in memory so they are available as Buffer for upload services
const storage = multer.memoryStorage();

const uploadConfig = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limit files to 10MB
  }
});

const upload = {
  fields: (fieldsArray) => {
    return uploadConfig.fields(fieldsArray);
  },
  single: (fieldName) => {
    return uploadConfig.single(fieldName);
  }
};

module.exports = { upload };
