const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    commission: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'platform_fee'
    },
    escrowAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'escrow_amount'
    },
    netAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'net_amount'
    },
    paymentMethod: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'payment_method',
      validate: {
        isIn: [['card', 'upi', 'net_banking', 'wallet']]
      }
    },
    transactionId: {
      type: DataTypes.STRING(100),
      unique: true,
      field: 'transaction_id'
    },
    paymentGateway: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'payment_gateway',
      validate: {
        isIn: [['razorpay', 'stripe']]
      }
    },
    gatewayResponse: {
      type: DataTypes.JSONB,
      defaultValue: {},
      field: 'gateway_response'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'success', 'failed', 'refunded', 'held', 'released']]
      }
    },
    escrowReleaseDate: {
      type: DataTypes.DATE,
      field: 'escrow_release_date'
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'refund_amount'
    },
    refundReason: {
      type: DataTypes.TEXT,
      field: 'refund_reason'
    },
    paymentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'payment_date'
    },
    releasedAt: {
      type: DataTypes.DATE,
      field: 'released_at'
    }
  }, {
    tableName: 'payments',
    underscored: true
  });

  return Payment;
};
