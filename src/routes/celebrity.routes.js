const router = require('express').Router();
const celebrityController = require('../controllers/celebrity.controller');
const galleryController = require('../controllers/gallery.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { checkCelebrityOrAdmin } = require('../middleware/rbac.middleware');
const { upload } = require('../middleware/upload.middleware');

router.use(authenticate);
router.use(checkCelebrityOrAdmin);

// === Dashboard ===
router.get('/dashboard', celebrityController.getDashboard);
router.get('/earnings', celebrityController.getEarnings);
router.get('/earnings/history', celebrityController.getEarningsHistory);

// === Profile Management ===
router.get('/profile', celebrityController.getProfile);
router.put('/profile', 
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'videoIntro', maxCount: 1 }
  ]),
  celebrityController.updateProfile
);

// === Pricing ===
router.put('/pricing', celebrityController.updatePricing);
router.get('/pricing', celebrityController.getPricing);

// === Availability ===
router.put('/availability', celebrityController.updateAvailability);
router.get('/availability', celebrityController.getAvailability);
router.put('/availability/block', celebrityController.blockDates);

// === Booking Management ===
router.get('/bookings', celebrityController.getCelebrityBookings);
router.get('/bookings/pending', celebrityController.getPendingBookings);
router.get('/bookings/accepted', celebrityController.getAcceptedBookings);
router.get('/bookings/completed', celebrityController.getCompletedBookings);
router.get('/bookings/:id', celebrityController.getBookingDetails);
router.put('/bookings/:id/approve', celebrityController.approveBooking);
router.put('/bookings/:id/reject', celebrityController.rejectBooking);

// === Gallery Management ===
router.post('/galleries', galleryController.createGallery);
router.get('/galleries', galleryController.getGalleries);
router.get('/galleries/:id', galleryController.getGalleryDetails);
router.put('/galleries/:id', galleryController.updateGallery);
router.delete('/galleries/:id', galleryController.deleteGallery);
router.post('/galleries/:id/media', upload.single('media'), galleryController.addGalleryMedia);
router.delete('/galleries/:id/media/:mediaId', galleryController.removeGalleryMedia);

// === Portfolio Management ===
router.post('/portfolio', upload.single('portfolio'), galleryController.addPortfolioItem);
router.get('/portfolio', galleryController.getPortfolioItems);
router.put('/portfolio/:id', galleryController.updatePortfolioItem);
router.delete('/portfolio/:id', galleryController.deletePortfolioItem);

// === Statistics & Analytics ===
router.get('/stats', celebrityController.getStats);
router.get('/reviews', celebrityController.getCelebrityReviews);
router.get('/analytics', celebrityController.getAnalytics);

module.exports = router;
