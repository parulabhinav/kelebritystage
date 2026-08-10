const { Sequelize } = require('sequelize');
const { config } = require('../config/database');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    define: config.define,
    dialectOptions: config.dialectOptions
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import Models
db.User = require('./User')(sequelize);
db.Verification = require('./Verification')(sequelize);
db.Celebrity = require('./Celebrity')(sequelize);
db.Category = require('./Category')(sequelize);
db.Address = require('./Address')(sequelize);
db.Booking = require('./Booking')(sequelize);
db.Event = require('./Event')(sequelize);
db.EventGallery = require('./EventGallery')(sequelize);
db.EventGalleryMedia = require('./EventGalleryMedia')(sequelize);
db.EventTestimonial = require('./EventTestimonial')(sequelize);
db.CelebrityPortfolio = require('./CelebrityPortfolio')(sequelize);
db.Payment = require('./Payment')(sequelize);
db.Wallet = require('./Wallet')(sequelize);
db.Transaction = require('./Transaction')(sequelize);
db.Notification = require('./Notification')(sequelize);
db.Review = require('./Review')(sequelize);
db.Dispute = require('./Dispute')(sequelize);
db.CommissionSetting = require('./Commission')(sequelize);
db.DeviceToken = require('./DeviceToken')(sequelize);
db.AuditLog = require('./AuditLog')(sequelize);

// Establish Associations

// User Associations
db.User.hasOne(db.Celebrity, { foreignKey: 'userId', as: 'celebrityProfile' });
db.User.hasMany(db.Address, { foreignKey: 'userId', as: 'addresses' });
db.User.hasMany(db.Booking, { foreignKey: 'userId', as: 'bookings' });
db.User.hasMany(db.Event, { foreignKey: 'userId', as: 'events' });
db.User.hasMany(db.Payment, { foreignKey: 'userId', as: 'payments' });
db.User.hasOne(db.Wallet, { foreignKey: 'userId', as: 'wallet' });
db.User.hasMany(db.Transaction, { foreignKey: 'userId', as: 'transactions' });
db.User.hasMany(db.Notification, { foreignKey: 'userId', as: 'notifications' });
db.User.hasMany(db.Review, { foreignKey: 'userId', as: 'reviews' });
db.User.hasMany(db.Dispute, { foreignKey: 'userId', as: 'disputes' });
db.User.hasMany(db.DeviceToken, { foreignKey: 'userId', as: 'deviceTokens' });
db.User.hasMany(db.AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
db.User.hasMany(db.Verification, { foreignKey: 'userId', as: 'verifications' });

// Verification
db.Verification.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Celebrity Associations
db.Celebrity.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Celebrity.hasMany(db.Booking, { foreignKey: 'celebrityId', as: 'bookings' });
db.Celebrity.hasMany(db.Event, { foreignKey: 'celebrityId', as: 'events' });
db.Celebrity.hasMany(db.EventGallery, { foreignKey: 'celebrityId', as: 'galleries' });
db.Celebrity.hasMany(db.CelebrityPortfolio, { foreignKey: 'celebrityId', as: 'portfolioItems' });
db.Celebrity.hasMany(db.Payment, { foreignKey: 'celebrityId', as: 'payments' });
db.Celebrity.hasMany(db.Review, { foreignKey: 'celebrityId', as: 'reviews' });
db.Celebrity.hasMany(db.Dispute, { foreignKey: 'celebrityId', as: 'disputes' });

// Address Associations
db.Address.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Address.hasMany(db.Booking, { foreignKey: 'addressId', as: 'bookings' });
db.Address.hasMany(db.Event, { foreignKey: 'addressId', as: 'events' });

// Booking Associations
db.Booking.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Booking.belongsTo(db.Celebrity, { foreignKey: 'celebrityId', as: 'celebrity' });
db.Booking.belongsTo(db.Event, { foreignKey: 'eventId', as: 'event' });
db.Booking.belongsTo(db.Address, { foreignKey: 'addressId', as: 'address' });
db.Booking.hasOne(db.Payment, { foreignKey: 'bookingId', as: 'payment' });
db.Booking.hasOne(db.Review, { foreignKey: 'bookingId', as: 'review' });
db.Booking.hasMany(db.Dispute, { foreignKey: 'bookingId', as: 'disputes' });

// Event Associations
db.Event.belongsTo(db.Booking, { foreignKey: 'bookingId', as: 'booking' });
db.Event.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Event.belongsTo(db.Celebrity, { foreignKey: 'celebrityId', as: 'celebrity' });
db.Event.belongsTo(db.Address, { foreignKey: 'addressId', as: 'address' });

// EventGallery Associations
db.EventGallery.belongsTo(db.Celebrity, { foreignKey: 'celebrityId', as: 'celebrity' });
db.EventGallery.hasMany(db.EventGalleryMedia, { foreignKey: 'galleryId', as: 'media' });
db.EventGallery.hasMany(db.EventTestimonial, { foreignKey: 'galleryId', as: 'testimonials' });

// EventGalleryMedia
db.EventGalleryMedia.belongsTo(db.EventGallery, { foreignKey: 'galleryId', as: 'gallery' });

// EventTestimonial Associations
db.EventTestimonial.belongsTo(db.EventGallery, { foreignKey: 'galleryId', as: 'gallery' });
db.EventTestimonial.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.EventTestimonial.belongsTo(db.Event, { foreignKey: 'eventId', as: 'event' });

// CelebrityPortfolio
db.CelebrityPortfolio.belongsTo(db.Celebrity, { foreignKey: 'celebrityId', as: 'celebrity' });

// Payment Associations
db.Payment.belongsTo(db.Booking, { foreignKey: 'bookingId', as: 'booking' });
db.Payment.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Payment.belongsTo(db.Celebrity, { foreignKey: 'celebrityId', as: 'celebrity' });

// Wallet Associations
db.Wallet.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Wallet.hasMany(db.Transaction, { foreignKey: 'walletId', as: 'transactions' });

// Transaction Associations
db.Transaction.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Transaction.belongsTo(db.Wallet, { foreignKey: 'walletId', as: 'wallet' });

// Notification Associations
db.Notification.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Review Associations
db.Review.belongsTo(db.Booking, { foreignKey: 'bookingId', as: 'booking' });
db.Review.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Review.belongsTo(db.Celebrity, { foreignKey: 'celebrityId', as: 'celebrity' });

// Dispute Associations
db.Dispute.belongsTo(db.Booking, { foreignKey: 'bookingId', as: 'booking' });
db.Dispute.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Dispute.belongsTo(db.Celebrity, { foreignKey: 'celebrityId', as: 'celebrity' });
db.Dispute.belongsTo(db.User, { foreignKey: 'resolvedBy', as: 'resolver' });

// DeviceToken
db.DeviceToken.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// AuditLog
db.AuditLog.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

module.exports = db;
