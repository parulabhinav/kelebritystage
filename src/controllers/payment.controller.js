const { Payment, Booking } = require('../models');
const { processBookingPayment } = require('../services/payment.service');

const processPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payment = await processBookingPayment(userId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Payment completed successfully and held in escrow',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.findAll({
      where: { userId },
      include: [{ model: Booking, as: 'booking', attributes: ['bookingNumber'] }],
      order: [['paymentDate', 'DESC']]
    });
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

const getPaymentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      where: { id },
      include: [{ model: Booking, as: 'booking', attributes: ['bookingNumber', 'status'] }]
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.userId !== userId && payment.celebrityId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to payment details' });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const getPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id, { attributes: ['id', 'status', 'transactionId'] });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  getPaymentHistory,
  getPaymentDetails,
  getPaymentStatus
};
