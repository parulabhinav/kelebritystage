const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
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
    walletId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'wallet_id'
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['credit', 'debit']]
      }
    },
    category: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: [['booking_payment', 'commission', 'refund', 'escrow_hold', 'escrow_release', 'platform_fee', 'bonus']]
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    referenceType: {
      type: DataTypes.STRING(20),
      field: 'reference_type',
      validate: {
        isIn: [['booking', 'payment', 'refund', 'commission']]
      }
    },
    referenceId: {
      type: DataTypes.UUID,
      field: 'reference_id'
    },
    description: {
      type: DataTypes.TEXT
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'transactions',
    underscored: true,
    timestamps: true,
    updatedAt: false // Only createdAt is needed for ledger
  });

  return Transaction;
};
