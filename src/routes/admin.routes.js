const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');

router.use(authenticate);
router.use(checkRole(['admin', 'super_admin']));

// === Dashboard ===
router.get('/dashboard', adminController.getDashboard);
router.get('/stats', adminController.getPlatformStats);

// === User Management ===
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// === Celebrity Management ===
router.get('/celebrities', adminController.getAllCelebrities);
router.get('/celebrities/pending', adminController.getPendingCelebrities);
router.get('/celebrities/:id', adminController.getCelebrityDetails);
router.put('/celebrities/:id/approve', adminController.approveCelebrity);
router.put('/celebrities/:id/reject', adminController.rejectCelebrity);
router.put('/celebrities/:id/suspend', adminController.suspendCelebrity);
router.put('/celebrities/:id/verify', adminController.verifyCelebrity);

// === Booking Management ===
router.get('/bookings', adminController.getAllBookings);
router.get('/bookings/filter', adminController.filterBookings);
router.get('/bookings/statistics', adminController.getBookingStatistics);
router.get('/bookings/:id', adminController.getBookingDetails);
router.put('/bookings/:id/status', adminController.updateBookingStatus);

// === Payment Management ===
router.get('/payments', adminController.getAllPayments);
router.get('/payments/reports', adminController.getPaymentReports);
router.get('/payments/:id', adminController.getPaymentDetails);
router.put('/payments/:id/release', adminController.releaseEscrowPayment);
router.put('/payments/:id/refund', adminController.refundPayment);

// === Event Management ===
router.get('/events', adminController.getAllEvents);
router.get('/events/:id', adminController.getEventDetails);
router.put('/events/:id/status', adminController.updateEventStatus);

// === Category Management ===
router.post('/categories', adminController.createCategory);
router.get('/categories', adminController.getAllCategories);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// === Commission Management ===
router.get('/commissions', adminController.getCommissionSettings);
router.put('/commissions', adminController.updateGlobalCommission);
router.post('/commissions/celebrity', adminController.setCelebrityCommission);
router.get('/commissions/celebrity/:id', adminController.getCelebrityCommission);
router.post('/commissions/category', adminController.setCategoryCommission);

// === Dispute Management ===
router.get('/disputes', adminController.getAllDisputes);
router.get('/disputes/:id', adminController.getDisputeDetails);
router.put('/disputes/:id/resolve', adminController.resolveDispute);
router.put('/disputes/:id/reject', adminController.rejectDispute);

// === Reports ===
router.get('/reports/analytics', adminController.getPlatformAnalytics);
router.get('/reports/payments', adminController.getPaymentReport);
router.get('/reports/users', adminController.getUserReport);
router.get('/reports/celebrities', adminController.getCelebrityReport);
router.get('/reports/bookings', adminController.getBookingReport);
router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/reports/top-celebrities', adminController.getTopCelebrities);

// === System Settings ===
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
