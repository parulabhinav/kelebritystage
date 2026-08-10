const { AuditLog } = require('../models');
const { logger } = require('../utils/logger');

// Helper to write audit logs directly from controllers
const writeAuditLog = async ({ userId, action, entityType, entityId, changes = {}, ipAddress, userAgent, metadata = {} }) => {
  try {
    await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      changes,
      ipAddress,
      userAgent,
      metadata
    });
  } catch (error) {
    logger.error(`Failed to write audit log: ${error.message}`);
  }
};

// Express middleware to capture and log administrative and high-value operations automatically
const auditAction = (actionName, entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    // Override res.json to capture response status/payload on success
    res.json = function (data) {
      res.json = originalJson; // Restore
      
      // Perform audit log asynchronously after sending the response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user ? req.user.id : null;
        const entityId = req.params.id || data.id || null;
        
        writeAuditLog({
          userId,
          action: actionName,
          entityType,
          entityId,
          changes: req.body,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          metadata: { statusCode: res.statusCode }
        });
      }
      
      return res.json(data);
    };
    
    next();
  };
};

module.exports = {
  writeAuditLog,
  auditAction
};
