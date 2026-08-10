const { User, Celebrity, Notification, DeviceToken, Review, Booking, CelebrityPortfolio, EventGallery, EventGalleryMedia } = require('../models');
const { Op } = require('sequelize');

const getCelebrities = async (req, res, next) => {
  try {
    const celebrities = await Celebrity.findAll({
      where: { isApproved: true, verificationStatus: 'approved' },
      include: [{ model: User, as: 'user', attributes: ['name', 'profileImage'] }]
    });
    return res.status(200).json({ success: true, data: celebrities });
  } catch (error) {
    next(error);
  }
};

const getCelebrityDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const celebrity = await Celebrity.findOne({
      where: { id, isApproved: true },
      include: [
        { model: User, as: 'user', attributes: ['name', 'email', 'profileImage'] },
        { model: CelebrityPortfolio, as: 'portfolioItems', where: { status: 'published' }, required: false },
        { model: EventGallery, as: 'galleries', where: { status: 'published' }, include: [{ model: EventGalleryMedia, as: 'media' }], required: false }
      ]
    });

    if (!celebrity) {
      return res.status(404).json({ success: false, message: 'Celebrity not found' });
    }
    return res.status(200).json({ success: true, data: celebrity });
  } catch (error) {
    next(error);
  }
};

const searchCelebrities = async (req, res, next) => {
  try {
    const { query } = req.query;
    const celebrities = await Celebrity.findAll({
      where: { isApproved: true, verificationStatus: 'approved' },
      include: [{
        model: User,
        as: 'user',
        where: {
          name: { [Op.iLike]: `%${query}%` }
        },
        attributes: ['name', 'profileImage']
      }]
    });
    return res.status(200).json({ success: true, data: celebrities });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findOne({ where: { id, userId: req.user.id } });
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notif.isRead = true;
    notif.readAt = new Date();
    await notif.save();

    return res.status(200).json({ success: true, data: notif });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.user.id, isRead: false } }
    );
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

const registerPushToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { token, platform } = req.body;

    const [deviceToken] = await DeviceToken.findOrCreate({
      where: { userId, token },
      defaults: { platform, isActive: true }
    });

    return res.status(200).json({ success: true, data: deviceToken });
  } catch (error) {
    next(error);
  }
};

const submitReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { bookingId, rating, review } = req.body;

    const booking = await Booking.findOne({ where: { id: bookingId, userId } });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ where: { bookingId } });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already submitted for this booking' });
    }

    const t = await Review.sequelize.transaction();
    try {
      const reviewObj = await Review.create({
        bookingId,
        userId,
        celebrityId: booking.celebrityId,
        rating,
        review,
        isPublic: true
      }, { transaction: t });

      // Update celebrity ratings average
      const celebrity = await Celebrity.findByPk(booking.celebrityId, { transaction: t });
      if (celebrity) {
        const totalRatingPoints = parseFloat(celebrity.rating) * celebrity.reviewCount;
        const newReviewCount = celebrity.reviewCount + 1;
        const newRating = (totalRatingPoints + rating) / newReviewCount;

        celebrity.reviewCount = newReviewCount;
        celebrity.rating = Math.round(newRating * 100) / 100;
        await celebrity.save({ transaction: t });
      }

      await t.commit();
      return res.status(201).json({ success: true, data: reviewObj });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: req.user.id },
      include: [{ model: Celebrity, as: 'celebrity', include: [{ model: User, as: 'user', attributes: ['name'] }] }]
    });
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCelebrities,
  getCelebrityDetails,
  searchCelebrities,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  registerPushToken,
  submitReview,
  getUserReviews
};
