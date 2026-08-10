const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bookingId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    review: {
      type: DataTypes.TEXT
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_public'
    }
  }, {
    tableName: 'reviews',
    underscored: true
  });

  return Review;
};
