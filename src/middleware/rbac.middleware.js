const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not have permission to perform this action.' });
    }

    next();
  };
};

const checkCelebrityOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
  }

  if (!['celebrity', 'admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden. Accessible only by Celebrities and Admins.' });
  }

  next();
};

module.exports = {
  checkRole,
  checkCelebrityOrAdmin
};
