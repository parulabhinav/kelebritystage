const { Booking, Event, Celebrity, Address, User } = require('../models');
const { createBookingRequest } = require('../services/booking.service');
const { refundPayment } = require('../services/escrow.service');
const { sendNotification } = require('../services/notification.service');

const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const booking = await createBookingRequest(userId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        {
          model: Celebrity,
          as: 'celebrity',
          include: [{ model: User, as: 'user', attributes: ['name', 'profileImage'] }]
        },
        {
          model: Event,
          as: 'event'
        },
        {
          model: Address,
          as: 'address'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

const getBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: { id },
      include: [
        {
          model: Celebrity,
          as: 'celebrity',
          include: [{ model: User, as: 'user', attributes: ['name', 'profileImage'] }]
        },
        {
          model: Event,
          as: 'event'
        },
        {
          model: Address,
          as: 'address'
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Auth validation: check if requester is user or celebrity user
    if (booking.userId !== userId) {
      const celebrity = await Celebrity.findOne({ where: { userId } });
      if (!celebrity || booking.celebrityId !== celebrity.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to booking details' });
      }
    }

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized cancellation request' });
    }

    if (['completed', 'cancelled', 'refunded', 'expired'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Booking cannot be cancelled in its current state' });
    }

    const t = await Booking.sequelize.transaction();
    try {
      booking.status = 'cancelled';
      booking.cancelledAt = new Date();
      booking.cancellationReason = cancellationReason || 'Cancelled by user';
      await booking.save({ transaction: t });

      // Settle payment refunds if payment was completed
      if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'held') {
        await refundPayment(booking.id, cancellationReason || 'User cancellation', t);
      }

      await t.commit();

      // Notify Celebrity
      const celebrity = await Celebrity.findByPk(booking.celebrityId);
      if (celebrity) {
        await sendNotification({
          userId: celebrity.userId,
          type: 'booking',
          title: 'Booking Cancelled by User',
          message: `Booking ${booking.bookingNumber} was cancelled by the client. Reason: ${cancellationReason || 'No reason provided'}`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
      });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

const getBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id, { attributes: ['id', 'status', 'paymentStatus'] });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
  getBookingStatus
};
