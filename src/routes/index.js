const router = require('express').Router();
const publicRoutes = require('./public.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const celebrityRoutes = require('./celebrity.routes');
const adminRoutes = require('./admin.routes');

// Prefix API version
const prefix = `/api/${process.env.API_VERSION || 'v1'}`;

router.use(`${prefix}/public`, publicRoutes);
router.use(`${prefix}/auth`, authRoutes);
router.use(`${prefix}/user`, userRoutes);
router.use(`${prefix}/celebrity`, celebrityRoutes);
router.use(`${prefix}/admin`, adminRoutes);

module.exports = router;
