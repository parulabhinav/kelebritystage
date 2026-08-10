const { User, Verification, Wallet } = require('../models');
const { generateOTP, verifyOTP: verifyOTPService, sendOTP } = require('../services/otp.service');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');
const { comparePassword, hashPassword } = require('../utils/encryption');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

const requestOTP = async (req, res, next) => {
  try {
    const { phoneNumber, email, type } = req.body;

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Find user to associate if exists
    const user = await User.findOne({ where: { phoneNumber } });

    await Verification.create({
      userId: user ? user.id : null,
      phoneNumber,
      email,
      otpCode: code,
      otpType: type || 'login',
      expiresAt
    });

    await sendOTP(phoneNumber, email, code, type || 'login');

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { phoneNumber, code, type, name, email, role } = req.body;

    const isValid = await verifyOTPService(phoneNumber, code, type || 'login');
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    let user = await User.findOne({ where: { phoneNumber } });

    // If verification type is register and user doesn't exist, create user
    if (!user) {
      if (!name) {
        return res.status(400).json({ success: false, message: 'User registration details (name) required for new phone number' });
      }
      
      const targetRole = role && ['user', 'celebrity','admin'].includes(role) ? role : 'user';
      
      user = await User.create({
        phoneNumber,
        name,
        email,
        isVerified: true,
        loginMethod: 'otp',
        role: targetRole
      });

      // Create wallet for new user
      await Wallet.create({ userId: user.id });

      // Create Celebrity profile if registered as celebrity
      if (targetRole === 'celebrity') {
        const { Celebrity } = require('../models');
        await Celebrity.create({
          userId: user.id,
          verificationStatus: 'pending',
          isApproved: false
        });
      }
    } else {
      user.isVerified = true;
      await user.save();
    }

    const accessToken = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profileImage: user.profileImage
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const registerWithPassword = async (req, res, next) => {
  try {
    const { phoneNumber, name, email, password, role } = req.body;

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ phoneNumber }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number or email already registered' });
    }

    const targetRole = role && ['user', 'celebrity'].includes(role) ? role : 'user';
    const passwordHash = await hashPassword(password);
    
    const user = await User.create({
      phoneNumber,
      name,
      email,
      passwordHash,
      loginMethod: 'password',
      isVerified: false,
      role: targetRole
    });

    // Create wallet
    await Wallet.create({ userId: user.id });

    // Create Celebrity profile if registered as celebrity
    if (targetRole === 'celebrity') {
      const { Celebrity } = require('../models');
      await Celebrity.create({
        userId: user.id,
        verificationStatus: 'pending',
        isApproved: false
      });
    }

    // Automatically generate and dispatch verification OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await Verification.create({
      userId: user.id,
      phoneNumber,
      email,
      otpCode: code,
      otpType: 'verify_phone',
      expiresAt
    });

    await sendOTP(phoneNumber, email, code, 'verify_phone');

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Verification OTP sent to your phone number.',
      data: {
        userId: user.id
      }
    });
  } catch (error) {
    next(error);
  }
};

const loginWithPassword = async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: emailOrPhone },
          { phoneNumber: emailOrPhone }
        ]
      }
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not verified. Please verify your phone number using the OTP code sent to you before logging in.',
        isVerified: false
      });
    }

    const accessToken = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profileImage: user.profileImage
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (userId) {
      const user = await User.findByPk(userId);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const newAccessToken = generateToken({ id: user.id, role: user.role });
    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash', 'refreshToken'] }
    });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, profileImage } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (email) user.email = email;
    if (profileImage) user.profileImage = profileImage;

    await user.save();
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    next(error);
  }
};



const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Mock link generation
    logger.info(`[MOCK PASSWORD RESET] Sent password reset link to ${email}`);
    return res.status(200).json({ success: true, message: 'Password reset link sent to email' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestOTP,
  verifyOTP,
  registerWithPassword,
  loginWithPassword,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword
};
