const { User, Celebrity, Booking, Payment, Event, Category, CommissionSetting, Dispute, AuditLog, Wallet } = require('../models');
const { releasePayment: releasePaymentService, refundPayment: refundPaymentService } = require('../services/escrow.service');
const { sendNotification } = require('../services/notification.service');
const { Op } = require('sequelize');

// === Dashboard & General Stats ===
const getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalCelebrities = await Celebrity.count();
    const totalBookings = await Booking.count();
    const payments = await Payment.findAll({ where: { status: 'success' } });

    let totalVolume = 0;
    let totalRevenue = 0;
    payments.forEach(p => {
      totalVolume += parseFloat(p.amount);
      totalRevenue += parseFloat(p.commission) + parseFloat(p.platformFee);
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCelebrities,
        totalBookings,
        totalVolume,
        totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPlatformStats = async (req, res, next) => {
  return getDashboard(req, res, next);
};

// === User Management ===
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { include: ['addresses', 'wallet'] });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = role;
    await user.save();

    return res.status(200).json({ success: true, message: 'User role updated', data: user });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = isActive;
    await user.save();

    return res.status(200).json({ success: true, message: 'User status updated', data: user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.destroy();
    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// === Celebrity Management ===
const getAllCelebrities = async (req, res, next) => {
  try {
    const celebrities = await Celebrity.findAll({ include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] });
    return res.status(200).json({ success: true, data: celebrities });
  } catch (error) {
    next(error);
  }
};

const getPendingCelebrities = async (req, res, next) => {
  try {
    const celebrities = await Celebrity.findAll({
      where: { verificationStatus: 'pending' },
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
    });
    return res.status(200).json({ success: true, data: celebrities });
  } catch (error) {
    next(error);
  }
};

const getCelebrityDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const celebrity = await Celebrity.findByPk(id, { include: [{ model: User, as: 'user' }] });
    if (!celebrity) return res.status(404).json({ success: false, message: 'Celebrity not found' });
    return res.status(200).json({ success: true, data: celebrity });
  } catch (error) {
    next(error);
  }
};

const approveCelebrity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const celebrity = await Celebrity.findByPk(id);
    if (!celebrity) return res.status(404).json({ success: false, message: 'Celebrity not found' });

    celebrity.isApproved = true;
    celebrity.verificationStatus = 'approved';
    celebrity.approvalDate = new Date();
    await celebrity.save();

    // Notify User
    await sendNotification({
      userId: celebrity.userId,
      type: 'system',
      title: 'Celebrity Profile Approved!',
      message: 'Congratulations! Your celebrity profile application has been approved by admin.'
    });

    return res.status(200).json({ success: true, message: 'Celebrity profile approved', data: celebrity });
  } catch (error) {
    next(error);
  }
};

const rejectCelebrity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const celebrity = await Celebrity.findByPk(id);
    if (!celebrity) return res.status(404).json({ success: false, message: 'Celebrity not found' });

    celebrity.isApproved = false;
    celebrity.verificationStatus = 'rejected';
    celebrity.rejectionReason = rejectionReason;
    await celebrity.save();

    await sendNotification({
      userId: celebrity.userId,
      type: 'system',
      title: 'Celebrity Profile Rejected',
      message: `Your celebrity application was rejected. Reason: ${rejectionReason || 'Documents mismatch'}`
    });

    return res.status(200).json({ success: true, message: 'Celebrity profile rejected', data: celebrity });
  } catch (error) {
    next(error);
  }
};

const suspendCelebrity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const celebrity = await Celebrity.findByPk(id);
    if (!celebrity) return res.status(404).json({ success: false, message: 'Celebrity not found' });

    celebrity.verificationStatus = 'suspended';
    celebrity.isApproved = false;
    await celebrity.save();

    return res.status(200).json({ success: true, message: 'Celebrity suspended', data: celebrity });
  } catch (error) {
    next(error);
  }
};

const verifyCelebrity = async (req, res, next) => {
  return approveCelebrity(req, res, next);
};

// === Booking Management ===
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({ order: [['createdAt', 'DESC']] });
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

const getBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id, { include: ['event', 'address'] });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

const filterBookings = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.query;
    const where = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const bookings = await Booking.findAll({ where });
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = status;
    await booking.save();

    return res.status(200).json({ success: true, message: 'Booking status updated', data: booking });
  } catch (error) {
    next(error);
  }
};

const getBookingStatistics = async (req, res, next) => {
  return getDashboard(req, res, next);
};

// === Payment Management ===
const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({ order: [['createdAt', 'DESC']] });
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

const getPaymentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const getPaymentReports = async (req, res, next) => {
  return getDashboard(req, res, next);
};

const releaseEscrowPayment = async (req, res, next) => {
  try {
    const { id } = req.params; // booking payment record id
    const payment = await Payment.findByPk(id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    await releasePaymentService(payment.bookingId);
    return res.status(200).json({ success: true, message: 'Escrow payment released to celebrity wallet' });
  } catch (error) {
    next(error);
  }
};

const refundPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const payment = await Payment.findByPk(id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    await refundPaymentService(payment.bookingId, reason || 'Admin refund action');
    return res.status(200).json({ success: true, message: 'Payment refunded to client wallet successfully' });
  } catch (error) {
    next(error);
  }
};

// === Event Management ===
const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.findAll({ order: [['eventDate', 'DESC']] });
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

const getEventDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

const updateEventStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    event.status = status;
    await event.save();

    return res.status(200).json({ success: true, message: 'Event status updated', data: event });
  } catch (error) {
    next(error);
  }
};

// === Category Management ===
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, displayOrder } = req.body;
    const category = await Category.create({ name, slug, description, displayOrder });
    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['displayOrder', 'ASC']] });
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, displayOrder, isActive } = req.body;

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (description) category.description = description;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    await category.destroy();
    return res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// === Commission Management ===
const getCommissionSettings = async (req, res, next) => {
  try {
    const settings = await CommissionSetting.findAll();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

const updateGlobalCommission = async (req, res, next) => {
  try {
    const { platformFeePercentage, commissionPercentage, minFee, maxFee, releaseDays } = req.body;

    const [setting] = await CommissionSetting.findOrCreate({
      where: { entityType: 'global' },
      defaults: { platformFeePercentage, commissionPercentage, minFee, maxFee, releaseDays }
    });

    if (platformFeePercentage !== undefined) setting.platformFeePercentage = platformFeePercentage;
    if (commissionPercentage !== undefined) setting.commissionPercentage = commissionPercentage;
    if (minFee !== undefined) setting.minFee = minFee;
    if (maxFee !== undefined) setting.maxFee = maxFee;
    if (releaseDays !== undefined) setting.releaseDays = releaseDays;

    await setting.save();
    return res.status(200).json({ success: true, data: setting });
  } catch (error) {
    next(error);
  }
};

const setCelebrityCommission = async (req, res, next) => {
  try {
    const { celebrityId, platformFeePercentage, commissionPercentage, minFee, maxFee, releaseDays } = req.body;

    const [setting] = await CommissionSetting.findOrCreate({
      where: { entityType: 'celebrity', entityId: celebrityId },
      defaults: { platformFeePercentage, commissionPercentage, minFee, maxFee, releaseDays }
    });

    setting.platformFeePercentage = platformFeePercentage;
    setting.commissionPercentage = commissionPercentage;
    if (minFee !== undefined) setting.minFee = minFee;
    if (maxFee !== undefined) setting.maxFee = maxFee;
    if (releaseDays !== undefined) setting.releaseDays = releaseDays;

    await setting.save();
    return res.status(200).json({ success: true, data: setting });
  } catch (error) {
    next(error);
  }
};

const getCelebrityCommission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const setting = await CommissionSetting.findOne({ where: { entityType: 'celebrity', entityId: id } });
    return res.status(200).json({ success: true, data: setting });
  } catch (error) {
    next(error);
  }
};

const setCategoryCommission = async (req, res, next) => {
  try {
    const { categoryId, platformFeePercentage, commissionPercentage, minFee, maxFee, releaseDays } = req.body;

    const [setting] = await CommissionSetting.findOrCreate({
      where: { entityType: 'category', entityId: categoryId },
      defaults: { platformFeePercentage, commissionPercentage, minFee, maxFee, releaseDays }
    });

    setting.platformFeePercentage = platformFeePercentage;
    setting.commissionPercentage = commissionPercentage;
    if (minFee !== undefined) setting.minFee = minFee;
    if (maxFee !== undefined) setting.maxFee = maxFee;
    if (releaseDays !== undefined) setting.releaseDays = releaseDays;

    await setting.save();
    return res.status(200).json({ success: true, data: setting });
  } catch (error) {
    next(error);
  }
};

// === Dispute Management ===
const getAllDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.findAll({ order: [['createdAt', 'DESC']] });
    return res.status(200).json({ success: true, data: disputes });
  } catch (error) {
    next(error);
  }
};

const getDisputeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dispute = await Dispute.findByPk(id, { include: ['booking'] });
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });
    return res.status(200).json({ success: true, data: dispute });
  } catch (error) {
    next(error);
  }
};

const resolveDispute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution, action } = req.body; // action: 'refund' or 'release'

    const dispute = await Dispute.findByPk(id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolvedBy = req.user.id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    if (action === 'refund') {
      await refundPaymentService(dispute.bookingId, `Dispute resolution: ${resolution}`);
    } else if (action === 'release') {
      await releasePaymentService(dispute.bookingId);
    }

    return res.status(200).json({ success: true, message: 'Dispute resolved successfully', data: dispute });
  } catch (error) {
    next(error);
  }
};

const rejectDispute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dispute = await Dispute.findByPk(id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

    dispute.status = 'rejected';
    await dispute.save();

    return res.status(200).json({ success: true, message: 'Dispute rejected', data: dispute });
  } catch (error) {
    next(error);
  }
};

// === Analytics Reports ===
const getPlatformAnalytics = async (req, res, next) => {
  return getDashboard(req, res, next);
};
const getPaymentReport = async (req, res, next) => {
  return getDashboard(req, res, next);
};
const getUserReport = async (req, res, next) => {
  return getAllUsers(req, res, next);
};
const getCelebrityReport = async (req, res, next) => {
  return getAllCelebrities(req, res, next);
};
const getBookingReport = async (req, res, next) => {
  return getAllBookings(req, res, next);
};
const getRevenueReport = async (req, res, next) => {
  return getDashboard(req, res, next);
};
const getTopCelebrities = async (req, res, next) => {
  try {
    const celebs = await Celebrity.findAll({
      limit: 5,
      order: [['rating', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['name'] }]
    });
    return res.status(200).json({ success: true, data: celebs });
  } catch (error) {
    next(error);
  }
};

// === System Settings & Audit Logs ===
const getSystemSettings = async (req, res, next) => {
  return res.status(200).json({ success: true, data: { status: 'online', maintenanceMode: false } });
};
const updateSystemSettings = async (req, res, next) => {
  return res.status(200).json({ success: true, message: 'System settings updated' });
};
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.findAll({ order: [['createdAt', 'DESC']], limit: 50 });
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getPlatformStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAllCelebrities,
  getPendingCelebrities,
  getCelebrityDetails,
  approveCelebrity,
  rejectCelebrity,
  suspendCelebrity,
  verifyCelebrity,
  getAllBookings,
  getBookingDetails,
  filterBookings,
  updateBookingStatus,
  getBookingStatistics,
  getAllPayments,
  getPaymentDetails,
  getPaymentReports,
  releaseEscrowPayment,
  refundPayment,
  getAllEvents,
  getEventDetails,
  updateEventStatus,
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCommissionSettings,
  updateGlobalCommission,
  setCelebrityCommission,
  getCelebrityCommission,
  setCategoryCommission,
  getAllDisputes,
  getDisputeDetails,
  resolveDispute,
  rejectDispute,
  getPlatformAnalytics,
  getPaymentReport,
  getUserReport,
  getCelebrityReport,
  getBookingReport,
  getRevenueReport,
  getTopCelebrities,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs
};
