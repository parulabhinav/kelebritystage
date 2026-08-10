const { Booking, Payment, Wallet, Transaction, Celebrity, sequelize } = require('../models');
const { creditPending, creditAvailable } = require('./wallet.service');

const holdPayment = async (bookingId, amount, transaction = null) => {
  const t = transaction || await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(bookingId, { transaction: t });
    if (!booking) throw new Error('Booking not found');

    booking.paymentStatus = 'held';
    booking.status = 'payment_held';
    await booking.save({ transaction: t });

    // Update Payment status to held
    const payment = await Payment.findOne({ where: { bookingId }, transaction: t });
    if (payment) {
      payment.status = 'held';
      await payment.save({ transaction: t });
    }

    // Move to Celebrity pending balance
    const celebrity = await Celebrity.findByPk(booking.celebrityId, { transaction: t });
    if (celebrity) {
      await creditPending(
        celebrity.userId,
        booking.amount,
        'booking',
        bookingId,
        `Escrow hold for Booking ID: ${booking.bookingNumber}`,
        t
      );
    }

    if (!transaction) await t.commit();
    return true;
  } catch (error) {
    if (!transaction) await t.rollback();
    throw error;
  }
};

const releasePayment = async (bookingId, transaction = null) => {
  const t = transaction || await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(bookingId, { transaction: t });
    if (!booking) throw new Error('Booking not found');

    if (booking.paymentStatus !== 'held') {
      throw new Error('Payment is not in escrow hold');
    }

    booking.paymentStatus = 'released';
    booking.status = 'payment_released';
    await booking.save({ transaction: t });

    const payment = await Payment.findOne({ where: { bookingId }, transaction: t });
    let netAmount = booking.amount - booking.commission;
    if (payment) {
      payment.status = 'released';
      payment.releasedAt = new Date();
      netAmount = payment.netAmount;
      await payment.save({ transaction: t });
    }

    const celebrity = await Celebrity.findByPk(booking.celebrityId, { transaction: t });
    if (celebrity) {
      // Credit celebrity available balance (this decrements pending balance)
      await creditAvailable(
        celebrity.userId,
        netAmount,
        'booking',
        bookingId,
        `Escrow payout release for Booking ID: ${booking.bookingNumber}`,
        t
      );

      // Increment Celebrity total earnings
      celebrity.totalEarnings = parseFloat(celebrity.totalEarnings) + parseFloat(netAmount);
      await celebrity.save({ transaction: t });
    }

    if (!transaction) await t.commit();
    return true;
  } catch (error) {
    if (!transaction) await t.rollback();
    throw error;
  }
};

const refundPayment = async (bookingId, refundReason, transaction = null) => {
  const t = transaction || await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(bookingId, { transaction: t });
    if (!booking) throw new Error('Booking not found');

    const payment = await Payment.findOne({ where: { bookingId }, transaction: t });
    if (!payment) throw new Error('Payment record not found');

    booking.paymentStatus = 'refunded';
    booking.status = 'cancelled';
    await booking.save({ transaction: t });

    payment.status = 'refunded';
    payment.refundAmount = payment.amount;
    payment.refundReason = refundReason;
    await payment.save({ transaction: t });

    // Debit from celebrity pending balance if it was held
    const celebrity = await Celebrity.findByPk(booking.celebrityId, { transaction: t });
    if (celebrity) {
      const wallet = await Wallet.findOne({ where: { userId: celebrity.userId }, transaction: t });
      if (wallet) {
        wallet.pendingBalance = Math.max(0, parseFloat(wallet.pendingBalance) - parseFloat(booking.amount));
        await wallet.save({ transaction: t });
      }
    }

    // Refund customer wallet/simulated refund credit
    const customerWallet = await Wallet.findOne({ where: { userId: booking.userId }, transaction: t });
    if (customerWallet) {
      customerWallet.balance = parseFloat(customerWallet.balance) + parseFloat(payment.amount);
      await customerWallet.save({ transaction: t });

      await Transaction.create({
        userId: booking.userId,
        walletId: customerWallet.id,
        type: 'credit',
        category: 'refund',
        amount: payment.amount,
        balance: customerWallet.balance,
        referenceType: 'booking',
        referenceId: bookingId,
        description: `Refund for Cancelled Booking ID: ${booking.bookingNumber}`
      }, { transaction: t });
    }

    if (!transaction) await t.commit();
    return true;
  } catch (error) {
    if (!transaction) await t.rollback();
    throw error;
  }
};

module.exports = {
  holdPayment,
  releasePayment,
  refundPayment
};
