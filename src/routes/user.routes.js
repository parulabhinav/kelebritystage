const router = require('express').Router();
const userController = require('../controllers/user.controller');
const bookingController = require('../controllers/booking.controller');
const paymentController = require('../controllers/payment.controller');
const addressController = require('../controllers/address.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// === Celebrity Discovery ===
router.get('/celebrities', userController.getCelebrities);
router.get('/celebrities/search', userController.searchCelebrities);
router.get('/celebrities/:id', userController.getCelebrityDetails);

// === Booking Management ===
router.post('/bookings', bookingController.createBooking);
router.get('/bookings', bookingController.getUserBookings);
router.get('/bookings/:id', bookingController.getBookingDetails);
router.put('/bookings/:id/cancel', bookingController.cancelBooking);
router.get('/bookings/:id/status', bookingController.getBookingStatus);

// === Address Management ===
router.post('/addresses', addressController.addAddress);
router.get('/addresses', addressController.getAddresses);
router.put('/addresses/:id', addressController.updateAddress);
router.put('/addresses/:id/verify', addressController.verifyAddress);
router.delete('/addresses/:id', addressController.deleteAddress);

// === Payment ===
router.post('/payments', paymentController.processPayment);
router.get('/payments', paymentController.getPaymentHistory);
router.get('/payments/:id', paymentController.getPaymentDetails);
router.get('/payments/status/:id', paymentController.getPaymentStatus);

// === Notifications ===
router.get('/notifications', userController.getNotifications);
router.put('/notifications/:id/read', userController.markNotificationRead);
router.put('/notifications/read-all', userController.markAllNotificationsRead);
router.post('/notifications/token', userController.registerPushToken);

// === Reviews ===
router.post('/reviews', userController.submitReview);
router.get('/reviews', userController.getUserReviews);

module.exports = router;
