const { createClient } = require('redis');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';
const redisPassword = process.env.REDIS_PASSWORD || '';

let redisClient = null;
let isConnected = false;

// Dummy client for graceful fallback
const dummyClient = {
  connect: async () => { console.log('Redis Fallback: using in-memory cache dummy client'); return; },
  get: async () => null,
  set: async () => 'OK',
  setEx: async () => 'OK',
  del: async () => 1,
  flushAll: async () => 'OK',
  quit: async () => {},
  on: () => {}
};

if (process.env.NODE_ENV !== 'test') {
  const url = redisPassword 
    ? `redis://:${redisPassword}@${redisHost}:${redisPort}`
    : `redis://${redisHost}:${redisPort}`;

  redisClient = createClient({
    url,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          return false; // Stop reconnecting after 3 failures
        }
        return 3000; // Retry every 3 seconds
      }
    }
  });

  redisClient.on('error', (err) => {
    // Only log the first few errors to avoid spamming the console
    if (isConnected || err.message.includes('ECONNREFUSED')) {
      console.warn('Redis Client Connection Warning:', err.message);
    }
    isConnected = false;
  });

  redisClient.on('connect', () => {
    console.log('Redis Client Connected');
    isConnected = true;
  });
} else {
  redisClient = dummyClient;
}

module.exports = {
  redisClient,
  getIsConnected: () => isConnected,
  dummyClient
};
