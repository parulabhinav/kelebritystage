const { Notification, DeviceToken } = require('../models');
const { logger } = require('../utils/logger');

const sendNotification = async ({ userId, type, title, message, data = {}, channels = ['in_app'] }) => {
  try {
    const notif = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      isRead: false,
      sentVia: channels
    });

    if (channels.includes('push')) {
      const tokens = await DeviceToken.findAll({ where: { userId, isActive: true } });
      tokens.forEach(tok => {
        logger.info(`[MOCK PUSH NOTIFICATION] Sent push to platform: ${tok.platform} with token: ${tok.token} | Title: ${title} | Body: ${message}`);
      });
    }

    if (channels.includes('sms')) {
      logger.info(`[MOCK SMS NOTIFICATION] Sent SMS to user ID: ${userId} | Message: ${message}`);
    }

    if (channels.includes('email')) {
      logger.info(`[MOCK EMAIL NOTIFICATION] Sent Email to user ID: ${userId} | Subject: ${title} | Message: ${message}`);
    }

    return notif;
  } catch (error) {
    logger.error(`Notification delivery failed: ${error.message}`);
  }
};

module.exports = {
  sendNotification
};
