const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validation.middleware');
const { authValidator } = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth.middleware');

// === OTP Based Authentication ===
router.post('/otp/request', 
  validateRequest(authValidator.requestOTP), 
  authController.requestOTP
);

router.post('/otp/verify', 
  validateRequest(authValidator.verifyOTP), 
  authController.verifyOTP
);

// === Password Based Authentication ===
router.post('/register', 
  validateRequest(authValidator.register), 
  authController.registerWithPassword
);

router.post('/login', 
  validateRequest(authValidator.login), 
  authController.loginWithPassword
);

// === Common Auth ===
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected Auth Routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;
