const { Booking } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const { sendNotification } = require('../services/notification.service');

const checkExpiredBookings = async () => {
  try {
    const expiredCount = await Booking.update(
      { status: 'expired' },
      {
        where: {
          status: 'pending',
          approvalDeadline: {
            [Op.lte]: new Date()
          }
        }
      }
    );

    if (expiredCount[0] > 0) {
      logger.info(`[SCHEDULER] Expired ${expiredCount[0]} pending bookings that passed their approval deadline.`);
    }
  } catch (error) {
    logger.error(`Error in booking expiry job: ${error.message}`);
  }
};

module.exports = { checkExpiredBookings };
