const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    phoneNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
      field: 'phone_number'
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      validate: {
        isEmail: true
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'celebrity', 'admin', 'super_admin']]
      }
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified'
    },
    profileImage: {
      type: DataTypes.STRING(500),
      field: 'profile_image'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login'
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      field: 'password_hash'
    },
    loginMethod: {
      type: DataTypes.STRING(20),
      defaultValue: 'otp',
      field: 'login_method',
      validate: {
        isIn: [['otp', 'password', 'both']]
      }
    },
    refreshToken: {
      type: DataTypes.STRING(500),
      field: 'refresh_token'
    }
  }, {
    tableName: 'users',
    underscored: true
  });

  return User;
};
