const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CommissionSetting = sequelize.define('CommissionSetting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    entityType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'entity_type',
      validate: {
        isIn: [['global', 'category', 'celebrity']]
      }
    },
    entityId: {
      type: DataTypes.UUID,
      field: 'entity_id'
    },
    platformFeePercentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 10.00,
      field: 'platform_fee_percentage'
    },
    commissionPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 15.00,
      field: 'commission_percentage'
    },
    minFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'min_fee'
    },
    maxFee: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'max_fee'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    releaseDays: {
      type: DataTypes.INTEGER,
      defaultValue: 14,
      field: 'release_days'
    }
  }, {
    tableName: 'commission_settings',
    underscored: true
  });

  return CommissionSetting;
};
