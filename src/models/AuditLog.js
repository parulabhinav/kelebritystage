const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id'
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'entity_type'
    },
    entityId: {
      type: DataTypes.UUID,
      field: 'entity_id'
    },
    changes: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    ipAddress: {
      type: DataTypes.STRING(45), // Support IPv6
      field: 'ip_address'
    },
    userAgent: {
      type: DataTypes.TEXT,
      field: 'user_agent'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'audit_logs',
    underscored: true,
    timestamps: true,
    updatedAt: false // Ledger style, only createdAt is needed
  });

  return AuditLog;
};
