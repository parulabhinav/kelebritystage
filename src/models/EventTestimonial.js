const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EventTestimonial = sequelize.define('EventTestimonial', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    galleryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'gallery_id'
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id'
    },
    eventId: {
      type: DataTypes.UUID,
      field: 'event_id'
    },
    testimonialText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'testimonial_text'
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      }
    },
    userName: {
      type: DataTypes.STRING(100),
      field: 'user_name'
    },
    userImage: {
      type: DataTypes.STRING(500),
      field: 'user_image'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified'
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_featured'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'approved', 'rejected']]
      }
    }
  }, {
    tableName: 'event_testimonials',
    underscored: true
  });

  return EventTestimonial;
};
