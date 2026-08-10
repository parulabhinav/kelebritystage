const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EventGallery = sequelize.define('EventGallery', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    celebrityId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'celebrity_id'
    },
    eventName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'event_name'
    },
    eventType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'event_type',
      validate: {
        isIn: [['appearance', 'performance', 'hosting', 'award_show', 'charity', 'corporate', 'private', 'virtual', 'concert', 'festival', 'other']]
      }
    },
    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'event_date'
    },
    eventLocation: {
      type: DataTypes.STRING(200),
      field: 'event_location'
    },
    eventDescription: {
      type: DataTypes.TEXT,
      field: 'event_description'
    },
    category: {
      type: DataTypes.STRING(50)
    },
    highlights: {
      type: DataTypes.TEXT
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_featured'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'published',
      validate: {
        isIn: [['draft', 'published', 'archived']]
      }
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'view_count'
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'like_count'
    }
  }, {
    tableName: 'event_galleries',
    underscored: true
  });

  return EventGallery;
};
