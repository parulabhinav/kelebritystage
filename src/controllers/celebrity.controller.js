const { Celebrity, User, Booking, Payment, Transaction, Wallet, Review, Event } = require('../models');
const { uploadFile } = require('../services/media.service');
const { sendNotification } = require('../services/notification.service');
const { Op } = require('sequelize');

const getCelebrityOrThrow = async (userId) => {
  const celebrity = await Celebrity.findOne({ where: { userId } });
  if (!celebrity) {
    const error = new Error('Celebrity profile not found');
    error.statusCode = 404;
    throw error;
  }
  return celebrity;
};

const getDashboard = async (req, res, next) => {
  try {
    const celebrity = await getCelebrityOrThrow(req.user.id);

    const pendingRequests = await Booking.count({ where: { celebrityId: celebrity.id, status: 'pending' } });
    const upcomingBookings = await Booking.count({ where: { celebrityId: celebrity.id, status: 'scheduled' } });
    const completedBookings = await Booking.count({ where: { celebrityId: celebrity.id, status: 'completed' } });

    return res.status(200).json({
      success: true,
      data: {
        totalEarnings: celebrity.totalEarnings,
        rating: celebrity.rating,
        reviewCount: celebrity.reviewCount,
        pendingRequests,
        upcomingBookings,
        completedBookings,
        availabilityStatus: celebrity.availabilityStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

const getEarnings = async (req, res, next) => {
  try {
    const celebrity = await getCelebrityOrThrow(req.user.id);
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    return res.status(200).json({
      success: true,
      data: {
        totalEarned: celebrity.totalEarnings,
        availableBalance: wallet ? wallet.balance : 0.00,
        pendingEscrow: wallet ? wallet.pendingBalance : 0.00
      }
    });
  } catch (error) {
    next(error);
  }
};

const getEarningsHistory = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(200).json({ success: true, data: [] });
    }
    const transactions = await Transaction.findAll({
      where: { walletId: wallet.id },
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const celebrity = await Celebrity.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'profileImage'] }]
    });
    if (!celebrity) {
      return res.status(404).json({ success: false, message: 'Celebrity profile not found' });
    }
    return res.status(200).json({ success: true, data: celebrity });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const celebrity = await getCelebrityOrThrow(req.user.id);
    const { bio, categories, skills, experienceYears, languagesSpoken, socialMedia } = req.body;

    // Handle files if uploaded
    if (req.files) {
      if (req.files.profileImage) {
        const url = await uploadFile(req.files.profileImage[0], 'profile-images');
        await User.update({ profileImage: url }, { where: { id: req.user.id } });
      }
      if (req.files.videoIntro) {
        const url = await uploadFile(req.files.videoIntro[0], 'video-intros');
        celebrity.videoIntroUrl = url;
      }
    }

    if (bio) celebrity.bio = bio;
    if (categories) celebrity.categories = categories;
    if (skills) celebrity.skills = skills;
    if (experienceYears) celebrity.experienceYears = experienceYears;
    if (languagesSpoken) celebrity.languagesSpoken = languagesSpoken;
    if (socialMedia) celebrity.socialMedia = socialMedia;

    celebrity.lastProfileUpdate = new Date();
    await celebrity.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: celebrity
    });
  } catch (error) {
    next(error);
  }
};

const updatePricing = async (req, res, next) => {
  try {
    const celebrity = await getCelebrityOrThrow(req.user.id);
    const { minimumPrice, maximumPrice } = req.body;

    if (minimumPrice) celebrity.minimumPrice = minimumPrice;
    if (maximumPrice) celebrity.maximumPrice = maximumPrice;

    await celebrity.save();
    return res.status(200).json({ success: true, message: 'Pricing updated successfully', data: celebrity });
  } catch (error) {
    next(error);
  }
};

const getPricing = async (req, res, next) => {
  try {
    const celebrity = await getCelebrityOrThrow(req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        minimumPrice: celebrity.minimumPrice,
        maximumPrice: celebrity.maximumPrice
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const celebrity = await getCelebrityOrThrow(req.user.id);
    const { availabilityStatus } = req.body;

    celebrity.availabilityStatus = availabilityStatus;
    await celebrity.save();

    return res.status(200).json({ success: true, message: 'Availability status updated', data: celebrity });
  } catch (error) {
    next(error);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    const celebrity = await getCelebrityOrThrow(req.user.id);
    return res.status(200).json({ success: true, data: { availabilityStatus: celebrity.availabilityStatus } });
  } catch (error) {
    next(error);
  }
};

const blockDates = async (req, res, next) => {
  try {
    // Blocks out dates (mock implementation by updating availability metadata)
    const celebrity = await getCelebrityOrThrow(req.user.id);
    const { startDate, endDate } = req.body;

    celebrity.availabilityStatus = 'busy';
    await celebrity.save();

    return res.status(200).json({
      success: true,
      message: 'Dates blocked successfully',
      data: { blockedRange: { startDate, endDate } }
    });
  } catch (error) {
    next(error);
  }
};

const getCelebrityBookings = async (req, res, next) => {
  try {
    const celebrity = await getCelebrityOrThrow(req.user.id);
    const { status } = req.query;

    const where = { celebrityId: celebrity.id };
    if (status) where.status = status;

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['name', 'profileImage'] },
        { model: Event, as: 'event' }
      ]
    });

    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

const getBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const celebrity = await getCelebrityOrThrow(req.user.id);

    const booking = await Booking.findOne({
      where: { id, celebrityId: celebrity.id },
      include: [
        { model: User, as: 'user', attributes: ['name', 'email', 'profileImage'] },
        { model: Event, as: 'event' }
      ]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

const approveBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const celebrity = await getCelebrityOrThrow(req.user.id);

    const booking = await Booking.findOne({ where: { id, celebrityId: celebrity.id, status: 'pending' } });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Pending booking request not found' });
    }

    booking.status = 'accepted';
    booking.approvalStatus = 'approved';
    booking.approvedAt = new Date();
    await booking.save();

    // Notify User
    await sendNotification({
      userId: booking.userId,
      type: 'booking',
      title: 'Booking Request Approved',
      message: `Your booking request ${booking.bookingNumber} has been approved by the celebrity. Please complete payment within the timeframe.`
    });

    return res.status(200).json({ success: true, message: 'Booking request approved', data: booking });
  } catch (error) {
    next(error);
  }
};

const rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const celebrity = await getCelebrityOrThrow(req.user.id);

    const booking = await Booking.findOne({ where: { id, celebrityId: celebrity.id, status: 'pending' } });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Pending booking request not found' });
    }

    booking.status = 'rejected';
    booking.approvalStatus = 'rejected';
    booking.rejectedAt = new Date();
    booking.rejectionReason = rejectionReason || 'Rejected by celebrity';
    await booking.save();

    // Notify User
    await sendNotification({
      userId: booking.userId,
      type: 'booking',
      title: 'Booking Request Rejected',
      message: `Your booking request ${booking.bookingNumber} was rejected by the celebrity. Reason: ${rejectionReason || 'No reason specified'}`
    });

    return res.status(200).json({ success: true, message: 'Booking request rejected', data: booking });
  } catch (error) {
    next(error);
  }
};

const getPendingBookings = async (req, res, next) => {
  req.query.status = 'pending';
  return getCelebrityBookings(req, res, next);
};

const getAcceptedBookings = async (req, res, next) => {
  req.query.status = 'accepted';
  return getCelebrityBookings(req, res, next);
};

const getCompletedBookings = async (req, res, next) => {
  req.query.status = 'completed';
  return getCelebrityBookings(req, res, next);
};

const getStats = async (req, res, next) => {
  return getDashboard(req, res, next);
};

const getCelebrityReviews = async (req, res, next) => {
  try {
    const celebrity = await getCelebrityOrThrow(req.user.id);
    const reviews = await Review.findAll({
      where: { celebrityId: celebrity.id },
      include: [{ model: User, as: 'user', attributes: ['name', 'profileImage'] }]
    });
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  return getDashboard(req, res, next);
};

module.exports = {
  getDashboard,
  getEarnings,
  getEarningsHistory,
  getProfile,
  updateProfile,
  updatePricing,
  getPricing,
  updateAvailability,
  getAvailability,
  blockDates,
  getCelebrityBookings,
  getBookingDetails,
  approveBooking,
  rejectBooking,
  getPendingBookings,
  getAcceptedBookings,
  getCompletedBookings,
  getStats,
  getCelebrityReviews,
  getAnalytics
};
