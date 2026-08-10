require('dotenv').config();

const config = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'celebrity_booking',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true
  },
  dialectOptions: {}
};

if (process.env.DB_SSL === 'true') {
  config.dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false
  };
}

module.exports = {
  development: config,
  test: { ...config, database: 'celebrity_booking_test', logging: false },
  production: config,
  config
};
