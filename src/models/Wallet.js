const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Wallet = sequelize.define('Wallet', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'user_id'
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    pendingBalance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'pending_balance',
      validate: {
        min: 0
      }
    },
    totalEarned: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'total_earned'
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'INR'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'wallets',
    underscored: true
  });

  return Wallet;
};
