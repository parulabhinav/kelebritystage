const upload = {
  fields: (fieldsArray) => {
    return (req, res, next) => {
      // Stub multipart file parsing and attach dummy files if mock file upload is triggered
      req.files = {};
      fieldsArray.forEach(f => {
        req.files[f.name] = [{
          originalname: `mock_${f.name}.png`,
          buffer: Buffer.from('mock_data'),
          mimetype: 'image/png'
        }];
      });
      next();
    };
  },
  single: (fieldName) => {
    return (req, res, next) => {
      req.file = {
        originalname: `mock_${fieldName}.png`,
        buffer: Buffer.from('mock_data'),
        mimetype: 'image/png'
      };
      next();
    };
  }
};

module.exports = { upload };
