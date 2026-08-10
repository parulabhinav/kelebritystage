const { checkExpiredBookings } = require('../jobs/booking-expiry');
const { checkEscrowReleases } = require('../jobs/release-escrow');
const { logger } = require('./logger');

const startScheduler = () => {
  logger.info('[SCHEDULER] Background worker scheduler started.');

  // Run booking expiry checks every 5 minutes
  setInterval(async () => {
    logger.info('[SCHEDULER] Running pending bookings expiry checks...');
    await checkExpiredBookings();
  }, 5 * 60 * 1000);

  // Run escrow release checks every 10 minutes
  setInterval(async () => {
    logger.info('[SCHEDULER] Running escrow release checks...');
    await checkEscrowReleases();
  }, 10 * 60 * 1000);
};

module.exports = { startScheduler };
