const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bookingNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'booking_number'
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
    eventId: {
      type: DataTypes.UUID,
      field: 'event_id'
    },
    addressId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'address_id'
    },
    status: {
      type: DataTypes.STRING(30),
      defaultValue: 'pending',
      validate: {
        isIn: [[
          'pending', 'under_review', 'accepted', 'rejected',
          'payment_pending', 'payment_completed', 'scheduled',
          'completed', 'payment_held', 'payment_released',
          'cancelled', 'expired'
        ]]
      }
    },
    approvalStatus: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      field: 'approval_status',
      validate: {
        isIn: [['pending', 'approved', 'rejected']]
      }
    },
    approvalDeadline: {
      type: DataTypes.DATE,
      field: 'approval_deadline'
    },
    approvedAt: {
      type: DataTypes.DATE,
      field: 'approved_at'
    },
    rejectedAt: {
      type: DataTypes.DATE,
      field: 'rejected_at'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      field: 'rejection_reason'
    },
    eventDetails: {
      type: DataTypes.JSONB,
      defaultValue: {},
      field: 'event_details'
    },
    appearanceType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'appearance_type'
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
    paymentStatus: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      field: 'payment_status',
      validate: {
        isIn: [['pending', 'paid', 'held', 'released', 'refunded']]
      }
    },
    paymentReleaseDate: {
      type: DataTypes.DATE,
      field: 'payment_release_date'
    },
    paymentHeldUntil: {
      type: DataTypes.DATE,
      field: 'payment_held_until'
    },
    completedAt: {
      type: DataTypes.DATE,
      field: 'completed_at'
    },
    cancelledAt: {
      type: DataTypes.DATE,
      field: 'cancelled_at'
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      field: 'cancellation_reason'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'bookings',
    underscored: true
  });

  return Booking;
};
