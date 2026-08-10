const { Booking } = require('../models');
const { releasePayment } = require('../services/escrow.service');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');

const checkEscrowReleases = async () => {
  try {
    // Find bookings where event is completed, payment status is 'held',
    // and payment release date is <= now.
    const eligibleBookings = await Booking.findAll({
      where: {
        status: 'completed',
        paymentStatus: 'held',
        paymentReleaseDate: {
          [Op.lte]: new Date()
        }
      }
    });

    for (const booking of eligibleBookings) {
      try {
        await releasePayment(booking.id);
        logger.info(`[SCHEDULER] Automatically released escrow payment for booking: ${booking.bookingNumber}`);
      } catch (err) {
        logger.error(`Failed to release escrow for booking ${booking.id}: ${err.message}`);
      }
    }
  } catch (error) {
    logger.error(`Error in escrow release job: ${error.message}`);
  }
};

module.exports = { checkEscrowReleases };
