const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Address = sequelize.define('Address', {
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
    addressLine1: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'address_line1'
    },
    addressLine2: {
      type: DataTypes.STRING(255),
      field: 'address_line2'
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'postal_code'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8)
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified'
    },
    verificationStatus: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      field: 'verification_status',
      validate: {
        isIn: [['pending', 'verified', 'rejected']]
      }
    },
    verificationDocuments: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_primary'
    }
  }, {
    tableName: 'addresses',
    underscored: true
  });

  return Address;
};
