const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bookingId: {
      type: DataTypes.UUID,
      field: 'booking_id'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    celebrityId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'celebrity_id'
    },
    eventType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'event_type',
      validate: {
        isIn: [['appearance', 'live_performance', 'corporate_event', 'private_event', 'virtual_appearance', 'promotion']]
      }
    },
    eventName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'event_name'
    },
    eventDescription: {
      type: DataTypes.TEXT,
      field: 'event_description'
    },
    eventDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'event_date'
    },
    eventEndDate: {
      type: DataTypes.DATE,
      field: 'event_end_date'
    },
    venueName: {
      type: DataTypes.STRING(200),
      field: 'venue_name'
    },
    addressId: {
      type: DataTypes.UUID,
      field: 'address_id'
    },
    eventLocation: {
      type: DataTypes.TEXT,
      field: 'event_location'
    },
    durationHours: {
      type: DataTypes.DECIMAL(4, 2),
      field: 'duration_hours'
    },
    expectedAudience: {
      type: DataTypes.INTEGER,
      field: 'expected_audience'
    },
    specialRequirements: {
      type: DataTypes.TEXT,
      field: 'special_requirements'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'scheduled',
      validate: {
        isIn: [['scheduled', 'completed', 'cancelled', 'rescheduled']]
      }
    }
  }, {
    tableName: 'events',
    underscored: true
  });

  return Event;
};
