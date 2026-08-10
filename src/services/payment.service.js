const { Payment, Booking, sequelize } = require('../models');
const { holdPayment } = require('./escrow.service');
const { sendNotification } = require('./notification.service');
const { AppError } = require('../utils/errors');

const processBookingPayment = async (userId, { bookingId, paymentMethod, paymentGateway, gatewayTransactionId }) => {
  const t = await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(bookingId, { transaction: t });
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    if (booking.userId !== userId) {
      throw new AppError('Unauthorized booking payment', 403);
    }
    if (booking.status !== 'accepted') {
      throw new AppError('Booking must be accepted by celebrity before paying', 400);
    }

    const netAmount = booking.amount - booking.commission;

    // Create payment record
    const payment = await Payment.create({
      bookingId,
      userId,
      celebrityId: booking.celebrityId,
      amount: booking.amount,
      commission: booking.commission,
      platformFee: booking.platformFee,
      escrowAmount: booking.escrowAmount,
      netAmount,
      paymentMethod,
      transactionId: gatewayTransactionId || `tx_${Date.now()}`,
      paymentGateway,
      status: 'success',
      paymentDate: new Date()
    }, { transaction: t });

    // Update booking status
    booking.paymentStatus = 'paid';
    booking.status = 'payment_completed';
    await booking.save({ transaction: t });

    // Trigger escrow hold in the same transaction
    await holdPayment(bookingId, booking.amount, t);

    // Notify User and Celebrity
    await sendNotification({
      userId,
      type: 'payment',
      title: 'Payment Successful',
      message: `Your payment of INR ${booking.amount} for booking ${booking.bookingNumber} was successful. Funds are now held in secure escrow.`
    });

    await t.commit();
    return payment;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  processBookingPayment
};
