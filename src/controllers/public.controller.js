const { Celebrity, User, Category, CelebrityPortfolio, EventGallery, EventGalleryMedia, Event } = require('../models');
const { Op } = require('sequelize');

const healthCheck = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Celebrity Booking Platform Backend API is healthy',
    timestamp: new Date()
  });
};

const getPublicCelebrities = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search, date, limit = 10, offset = 0 } = req.query;

    const whereClause = {
      isApproved: true,
      verificationStatus: 'approved'
    };

    if (category) {
      whereClause.categories = {
        [Op.contains]: [category]
      };
    }

    if (minPrice || maxPrice) {
      whereClause.minimumPrice = {};
      if (minPrice) whereClause.minimumPrice[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.minimumPrice[Op.lte] = parseFloat(maxPrice);
    }

    // Date Availability Search Filter
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // 1. Get IDs of celebrities with scheduled bookings on this date
      const busyEvents = await Event.findAll({
        where: {
          status: 'scheduled',
          eventDate: {
            [Op.between]: [startOfDay, endOfDay]
          }
        },
        attributes: ['celebrityId']
      });
      const busyCelebIds = busyEvents.map(e => e.celebrityId);

      // 2. Get IDs of celebrities who blocked this date manually
      const blockedCelebs = await Celebrity.findAll({
        where: {
          blockedDates: {
            [Op.contains]: [date]
          }
        },
        attributes: ['id']
      });
      const blockedCelebIds = blockedCelebs.map(c => c.id);

      // Combine and filter out unavailable celebrities
      const unavailableIds = [...new Set([...busyCelebIds, ...blockedCelebIds])];
      if (unavailableIds.length > 0) {
        whereClause.id = {
          [Op.notIn]: unavailableIds
        };
      }
    }

    const userWhereClause = {};
    if (search) {
      userWhereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    const { count, rows: celebrities } = await Celebrity.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        where: userWhereClause,

        attributes: ['name', 'email', 'profileImage']
      }],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['rating', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: {
        total: count,
        celebrities
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPublicCelebrityDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const celebrity = await Celebrity.findOne({
      where: { id, isApproved: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'profileImage']
        },
        {
          model: CelebrityPortfolio,
          as: 'portfolioItems',
          where: { status: 'published' },
          required: false
        },
        {
          model: EventGallery,
          as: 'galleries',
          where: { status: 'published' },
          include: [{ model: EventGalleryMedia, as: 'media' }],
          required: false
        }
      ]
    });

    if (!celebrity) {
      return res.status(404).json({ success: false, message: 'Celebrity profile not found' });
    }

    return res.status(200).json({
      success: true,
      data: celebrity
    });
  } catch (error) {
    next(error);
  }
};

const getPublicCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC']]
    });
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const getCelebritiesByCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ where: { slug, isActive: true } });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const celebrities = await Celebrity.findAll({
      where: {
        isApproved: true,
        verificationStatus: 'approved',
        categories: {
          [Op.contains]: [category.name]
        }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'profileImage']
      }]
    });

    return res.status(200).json({
      success: true,
      data: {
        category,
        celebrities
      }
    });
  } catch (error) {
    next(error);
  }
};

const { hashPassword } = require('../utils/encryption');

const seedDatabase = async (req, res, next) => {
  try {
    // 1. Sync models
    const { sequelize } = require('../models');
    await sequelize.sync({ force: true }); // Reset DB

    // 2. Create Categories
    const actorCategory = await Category.create({
      name: 'Actor',
      slug: 'actor',
      description: 'Movie stars and stage actors',
      displayOrder: 1,
      isActive: true
    });

    const singerCategory = await Category.create({
      name: 'Singer',
      slug: 'singer',
      description: 'Musicians, vocalists, and bands',
      displayOrder: 2,
      isActive: true
    });

    // 3. Create Users
    const hashedPass = await hashPassword('password123');

    const clientUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      phoneNumber: '+919999999999',
      role: 'user',
      isVerified: true,
      passwordHash: hashedPass,
      loginMethod: 'both'
    });

    const celebUser = await User.create({
      name: 'Celebrity Star',
      email: 'celeb@example.com',
      phoneNumber: '+918888888888',
      role: 'celebrity',
      isVerified: true,
      passwordHash: hashedPass,
      loginMethod: 'both',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    });

    const adminUser = await User.create({
      name: 'Admin Manager',
      email: 'admin@example.com',
      phoneNumber: '+917777777777',
      role: 'admin',
      isVerified: true,
      passwordHash: hashedPass,
      loginMethod: 'both'
    });

    // 4. Create Celebrity Profile
    const celebrityProfile = await Celebrity.create({
      userId: celebUser.id,
      bio: 'Popular Movie Star and Influencer.',
      stageName: 'Celebrity Star',
      minimumPrice: 1500,
      videoCallRate: 2500,
      chatRate: 500,
      categories: ['Actor'],
      rating: 4.9,
      verificationStatus: 'approved',
      isApproved: true,
      isAvailable: true
    });

    return res.status(200).json({
      success: true,
      message: 'Database reset and seeded successfully with client, celebrity, and admin test users!',
      data: {
        users: {
          client: 'john@example.com',
          celebrity: 'celeb@example.com',
          admin: 'admin@example.com'
        },
        password: 'password123',
        celebrityId: celebrityProfile.id
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPublicCelebrityAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const celebrity = await Celebrity.findByPk(id);
    if (!celebrity) {
      return res.status(404).json({ success: false, message: 'Celebrity not found' });
    }

    const scheduledEvents = await Event.findAll({
      where: {
        celebrityId: id,
        status: 'scheduled'
      },
      attributes: ['eventDate']
    });

    const bookedDates = scheduledEvents.map(e => {
      return new Date(e.eventDate).toISOString().split('T')[0];
    });

    return res.status(200).json({
      success: true,
      data: {
        availabilityStatus: celebrity.availabilityStatus,
        blockedDates: celebrity.blockedDates || [],
        bookedDates: bookedDates
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  healthCheck,
  getPublicCelebrities,
  getPublicCelebrityDetails,
  getPublicCategories,
  getCelebritiesByCategory,
  seedDatabase,
  getPublicCelebrityAvailability
};

