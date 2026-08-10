const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Verification = sequelize.define('Verification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'user_id'
    },
    phoneNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      field: 'phone_number'
    },
    email: {
      type: DataTypes.STRING(100)
    },
    otpCode: {
      type: DataTypes.STRING(6),
      allowNull: false,
      field: 'otp_code'
    },
    otpType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'otp_type',
      validate: {
        isIn: [['login', 'register', 'password_reset', 'verify_phone', 'verify_email']]
      }
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_used'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at'
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'verifications',
    underscored: true
  });

  return Verification;
};
