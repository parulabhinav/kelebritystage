const { Sequelize } = require('sequelize');
const { config } = require('../config/database');
const { hashPassword } = require('../utils/encryption');
const { logger } = require('../utils/logger');

const runSmokeTest = async () => {
  logger.info('--- Starting Backend Smoke Test & Seeding ---');
  try {
    // 1. Connect to postgres default database and create database celebrity_booking if not exists
    const tempSequelize = new Sequelize('postgres', config.username, config.password, {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: false
    });
    
    try {
      await tempSequelize.query('CREATE DATABASE celebrity_booking;');
      logger.info('Database "celebrity_booking" created successfully.');
    } catch (dbErr) {
      if (dbErr.name === 'SequelizeDatabaseError' && dbErr.message.includes('already exists')) {
        logger.info('Database "celebrity_booking" already exists.');
      } else {
        throw dbErr;
      }
    } finally {
      await tempSequelize.close();
    }

    // Now load standard model registry
    const db = require('../models');
    const { sequelize, Category, CommissionSetting, User, Celebrity, Address, Booking, Event, Wallet, Payment } = db;
    const { createBookingRequest } = require('../services/booking.service');
    const { processBookingPayment } = require('../services/payment.service');
    const { releasePayment } = require('../services/escrow.service');

    // 2. Sync DB
    await sequelize.sync({ force: true });
    logger.info('Database reset and synced.');

    // 3. Seed Categories
    const categoriesToSeed = [
      { name: 'Hero', slug: 'hero', description: 'Leading actors and action stars', displayOrder: 1 },
      { name: 'Actress', slug: 'actress', description: 'Leading actresses and performers', displayOrder: 2 },
      { name: 'Comedian', slug: 'comedian', description: 'Stand-up comedians and humorists', displayOrder: 3 },
      { name: 'Magician', slug: 'magician', description: 'Magicians and illusionists', displayOrder: 4 },
      { name: 'Musician', slug: 'musician', description: 'Singers and bands', displayOrder: 5 }
    ];
    await Category.bulkCreate(categoriesToSeed);
    logger.info('Categories seeded.');

    // 4. Seed Global Commission Setting
    await CommissionSetting.create({
      entityType: 'global',
      platformFeePercentage: 10.00,
      commissionPercentage: 15.00,
      minFee: 50.00,
      releaseDays: 14,
      isActive: true
    });
    logger.info('Global Commission Settings seeded.');

    // 5. Create Users
    const passwordHash = await hashPassword('password123');

    // Create Admin User
    const admin = await User.create({
      phoneNumber: '+919999999999',
      email: 'admin@bookmyceleb.com',
      name: 'Super Admin',
      role: 'admin',
      isVerified: true,
      loginMethod: 'password',
      passwordHash
    });
    await Wallet.create({ userId: admin.id });

    // Create Client User
    const client = await User.create({
      phoneNumber: '+918888888888',
      email: 'client@gmail.com',
      name: 'John Doe',
      role: 'user',
      isVerified: true,
      loginMethod: 'password',
      passwordHash
    });
    await Wallet.create({ userId: client.id });

    // Create Celebrity User
    const celebrityUser = await User.create({
      phoneNumber: '+917777777777',
      email: 'celebrity@gmail.com',
      name: 'Rockstar Rohan',
      role: 'celebrity',
      isVerified: true,
      loginMethod: 'password',
      passwordHash
    });
    await Wallet.create({ userId: celebrityUser.id });

    // Create Celebrity Profile
    const celebrityProfile = await Celebrity.create({
      userId: celebrityUser.id,
      bio: 'Singer and Composer',
      categories: ['Musician'],
      isApproved: true,
      verificationStatus: 'approved',
      minimumPrice: 10000.00,
      maximumPrice: 50000.00,
      availabilityStatus: 'available',
      rating: 4.80,
      reviewCount: 1
    });
    logger.info('Admin, Client, and Celebrity profiles created and seeded.');

    // 6. Add Address for Client
    const address = await Address.create({
      userId: client.id,
      addressLine1: 'Flat 101, Star Heights',
      addressLine2: 'Galaxy Lane',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400001',
      isPrimary: true,
      isVerified: true,
      verificationStatus: 'verified'
    });
    logger.info('Client primary address created and verified.');

    // 7. Test Booking Request Creation
    logger.info('Creating a mock booking request...');
    const booking = await createBookingRequest(client.id, {
      celebrityId: celebrityProfile.id,
      addressId: address.id,
      appearanceType: 'live_performance',
      amount: 20000.00,
      eventDetails: {
        eventName: 'New Year Bash',
        description: 'Live musical appearance at the club',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
      }
    });
    logger.info(`Booking request created successfully. Booking Number: ${booking.bookingNumber}`);

    // 8. Celebrity Approves Booking
    booking.status = 'accepted';
    booking.approvalStatus = 'approved';
    await booking.save();
    logger.info('Celebrity approved the booking request.');

    // 9. Process Booking Payment
    logger.info('Processing booking checkout payment...');
    const payment = await processBookingPayment(client.id, {
      bookingId: booking.id,
      paymentMethod: 'card',
      paymentGateway: 'stripe',
      gatewayTransactionId: 'ch_mock_stripe_transaction_id'
    });
    logger.info(`Payment processed successfully. Payment Status: ${payment.status} | Escrow Amount: INR ${payment.escrowAmount}`);

    // 10. Settle Escrow Payout (simulate admin payout release)
    logger.info('Simulating admin releasing payment escrow to celebrity wallet...');
    await releasePayment(booking.id);

    const celebWallet = await Wallet.findOne({ where: { userId: celebrityUser.id } });
    logger.info(`Escrow released successfully. Celebrity Wallet available balance: INR ${celebWallet.balance}`);

    logger.info('--- Smoke Test Completed Successfully! Backend is fully functional. ---');
    process.exit(0);
  } catch (error) {
    logger.error(`Smoke test failed: ${error.message}`);
    process.exit(1);
  }
};

runSmokeTest();
