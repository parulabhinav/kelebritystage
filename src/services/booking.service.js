const { Booking, Event, Celebrity, Address, User, sequelize } = require('../models');
const { calculateSplit } = require('./commission.service');
const { sendNotification } = require('./notification.service');
const { AppError } = require('../utils/errors');

const createBookingRequest = async (userId, { celebrityId, addressId, appearanceType, amount, eventDetails }) => {
  const t = await sequelize.transaction();
  try {
    // 1. Verify address exists and is verified
    const address = await Address.findOne({ where: { id: addressId, userId }, transaction: t });
    if (!address) {
      throw new AppError('Address not found or unauthorized', 404);
    }
    if (!address.isVerified) {
      throw new AppError('Address must be verified before booking', 400);
    }

    // 2. Fetch Celebrity
    const celebrity = await Celebrity.findByPk(celebrityId, { include: ['user'], transaction: t });
    if (!celebrity || !celebrity.isApproved) {
      throw new AppError('Celebrity is not available or approved', 400);
    }

    // 3. Calculate Commission Split
    const splits = await calculateSplit(amount, celebrityId);
    
    // 4. Generate Booking Number
    const bookingNumber = `BMC${Date.now().toString().slice(-8)}${Math.floor(10 + Math.random() * 90)}`;

    // 5. Calculate deadline (24-72 hours, let's default to 48 hours from now)
    const approvalDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // 6. Create booking record
    const booking = await Booking.create({
      bookingNumber,
      userId,
      celebrityId,
      addressId,
      status: 'pending',
      appearanceType,
      amount,
      commission: splits.commission,
      platformFee: splits.platformFee,
      escrowAmount: splits.escrowAmount,
      paymentStatus: 'pending',
      approvalDeadline,
      eventDetails,
      metadata: { releaseDays: splits.releaseDays }
    }, { transaction: t });

    // 7. Create event details record (scheduled)
    const event = await Event.create({
      bookingId: booking.id,
      userId,
      celebrityId,
      eventType: appearanceType,
      eventName: eventDetails.eventName || `Appearance by ${celebrity.user.name}`,
      eventDescription: eventDetails.description || '',
      eventDate: new Date(eventDetails.date),
      eventEndDate: eventDetails.endDate ? new Date(eventDetails.endDate) : null,
      venueName: eventDetails.venueName || '',
      addressId,
      status: 'scheduled'
    }, { transaction: t });

    // Associate Event to Booking
    booking.eventId = event.id;
    await booking.save({ transaction: t });

    // 8. Notify Celebrity
    await sendNotification({
      userId: celebrity.userId,
      type: 'booking',
      title: 'New Booking Request Received',
      message: `You have received a new booking request ${bookingNumber}. Please approve or reject it within 48 hours.`,
      data: { bookingId: booking.id }
    });

    await t.commit();
    return booking;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  createBookingRequest
};
