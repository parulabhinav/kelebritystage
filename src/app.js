require('dotenv').config(); // Trigger nodemon reload
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { sequelize } = require('./models');
const { redisClient } = require('./config/redis');
const routes = require('./routes');
const { globalErrorHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const { logger } = require('./utils/logger');
const { startScheduler } = require('./utils/scheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Optimization Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Apply Rate Limiting
app.use('/api/', apiLimiter);

// Register API Routes
app.use(routes);

// Default Route
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Global Error Handler
app.use(globalErrorHandler);

// Start Application function
const startServer = async () => {
  try {
    // 1. Authenticate Database
    await sequelize.authenticate();
    logger.info('PostgreSQL Database connected successfully.');

    // 2. Connect Redis Client
    try {
      await redisClient.connect();
    } catch (redisErr) {
      logger.warn(`Redis Client connection skipped/failed: ${redisErr.message}`);
    }

    // 4. Start scheduler jobs
    startScheduler();

    // 5. Listen
    app.listen(PORT, () => {
      logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Application startup failed: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
