const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Dispute = sequelize.define('Dispute', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bookingId: {
      type: DataTypes.UUID,
      allowNull: false,
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
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['payment', 'delivery', 'quality', 'other']]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'open',
      validate: {
        isIn: [['open', 'under_review', 'resolved', 'rejected']]
      }
    },
    resolution: {
      type: DataTypes.TEXT
    },
    resolvedBy: {
      type: DataTypes.UUID,
      field: 'resolved_by'
    },
    resolvedAt: {
      type: DataTypes.DATE,
      field: 'resolved_at'
    }
  }, {
    tableName: 'disputes',
    underscored: true
  });

  return Dispute;
};
