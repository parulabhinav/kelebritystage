const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Celebrity = sequelize.define('Celebrity', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    bio: {
      type: DataTypes.TEXT
    },
    categories: {
      type: DataTypes.ARRAY(DataTypes.STRING(50)),
      defaultValue: []
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_approved'
    },
    approvalDate: {
      type: DataTypes.DATE,
      field: 'approval_date'
    },
    verificationStatus: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      field: 'verification_status',
      validate: {
        isIn: [['pending', 'approved', 'rejected', 'suspended']]
      }
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      field: 'rejection_reason'
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'total_earnings'
    },
    totalBookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_bookings'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'review_count'
    },
    videoIntroUrl: {
      type: DataTypes.STRING(500),
      field: 'video_intro_url'
    },
    socialLinks: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    minimumPrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'minimum_price'
    },
    maximumPrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'maximum_price'
    },
    responseTime: {
      type: DataTypes.STRING(20),
      field: 'response_time'
    },
    portfolio: {
      type: DataTypes.JSONB,
      defaultValue: { images: [], videos: [], documents: [] }
    },
    socialMedia: {
      type: DataTypes.JSONB,
      defaultValue: {
        instagram: '',
        twitter: '',
        youtube: '',
        facebook: '',
        tiktok: '',
        linkedin: '',
        website: ''
      },
      field: 'social_media'
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.TEXT)
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'experience_years'
    },
    languagesSpoken: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      field: 'languages_spoken'
    },
    availabilityStatus: {
      type: DataTypes.STRING(20),
      defaultValue: 'available',
      field: 'availability_status',
      validate: {
        isIn: [['available', 'busy', 'on_leave', 'not_available']]
      }
    },
    lastProfileUpdate: {
      type: DataTypes.DATE,
      field: 'last_profile_update'
    },
    profileCompleteness: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'profile_completeness'
    }
  }, {
    tableName: 'celebrities',
    underscored: true
  });

  return Celebrity;
};
