const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeviceToken = sequelize.define('DeviceToken', {
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
    token: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    platform: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['ios', 'android', 'web']]
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'device_tokens',
    underscored: true
  });

  return DeviceToken;
};
