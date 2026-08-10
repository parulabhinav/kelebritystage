const router = require('express').Router();
const { 
  getPublicCelebrities, 
  getPublicCelebrityDetails,
  getPublicCategories,
  getCelebritiesByCategory,
  healthCheck,
  seedDatabase,
  getPublicCelebrityAvailability
} = require('../controllers/public.controller');

// Health check
router.get('/health', healthCheck);

// Seeder
router.post('/seed', seedDatabase);

// Celebrity discovery
router.get('/celebrities', getPublicCelebrities);
router.get('/celebrities/:id', getPublicCelebrityDetails);
router.get('/celebrities/:id/availability', getPublicCelebrityAvailability);

// Categories
router.get('/categories', getPublicCategories);
router.get('/categories/:slug/celebrities', getCelebritiesByCategory);

module.exports = router;
