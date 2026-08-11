const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Wallet, Verification } = require('../src/models');
const { redisClient } = require('../src/config/redis');

// Custom reporter summary collector
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function recordResult(name, category, passed, details = null) {
  results.tests.push({ name, category, passed, details });
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
}

describe('Phase 1 - Backend API & Authentication Test Suite', () => {
  let createdUserId = null;
  let accessToken = null;
  let refreshToken = null;

  const timestamp = Date.now();
  const testPhone = `+9199${timestamp.toString().slice(-8)}`;
  const testEmail = `api-test-${timestamp}@example.com`;
  const testPassword = 'Test@123456';

  afterAll(async () => {
    // Clean up created test user and associated records if created
    if (createdUserId) {
      await Verification.destroy({ where: { userId: createdUserId } }).catch(() => {});
      await Wallet.destroy({ where: { userId: createdUserId } }).catch(() => {});
      await User.destroy({ where: { id: createdUserId } }).catch(() => {});
    }

    // Close Redis & Database connections safely
    try {
      if (redisClient && typeof redisClient.quit === 'function') {
        await redisClient.quit().catch(() => {});
      }
      await sequelize.close().catch(() => {});
    } catch (e) {}

    // Print summary box
    console.log('\n========================================');
    console.log('KELIBRITYSTAGE BACKEND API TESTS');
    console.log('========================================\n');

    const categories = ['PUBLIC APIs', 'AUTHENTICATION', 'SECURITY', 'DATABASE'];
    categories.forEach(cat => {
      console.log(cat);
      results.tests.filter(t => t.category === cat).forEach(t => {
        if (t.passed) {
          console.log(`  ✅ ${t.name}`);
        } else {
          console.log(`  ❌ ${t.name}`);
          if (t.details) {
            console.log(`     Reason: ${t.details}`);
          }
        }
      });
      console.log('');
    });

    console.log('========================================');
    console.log(`PASSED: ${results.passed}`);
    console.log(`FAILED: ${results.failed}`);
    console.log('========================================');
    console.log(`RESULT: ${results.failed === 0 ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}\n`);
  });

  // --------------------------------------------------
  // 1. PUBLIC APIs
  // --------------------------------------------------
  test('1. GET /api/v1/public/health', async () => {
    try {
      const res = await request(app).get('/api/v1/public/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message || res.body.data).toBeDefined();
      recordResult('GET /api/v1/public/health', 'PUBLIC APIs', true);
    } catch (err) {
      recordResult('GET /api/v1/public/health', 'PUBLIC APIs', false, err.message);
      throw err;
    }
  });

  test('2. GET /api/v1/public/categories', async () => {
    try {
      const res = await request(app).get('/api/v1/public/categories');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      recordResult('GET /api/v1/public/categories', 'PUBLIC APIs', true);
    } catch (err) {
      recordResult('GET /api/v1/public/categories', 'PUBLIC APIs', false, err.message);
      throw err;
    }
  });

  test('3. GET /api/v1/public/celebrities', async () => {
    try {
      const res = await request(app).get('/api/v1/public/celebrities');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      recordResult('GET /api/v1/public/celebrities', 'PUBLIC APIs', true);
    } catch (err) {
      recordResult('GET /api/v1/public/celebrities', 'PUBLIC APIs', false, err.message);
      throw err;
    }
  });

  // --------------------------------------------------
  // 2. AUTHENTICATION & DATABASE SIDE EFFECTS
  // --------------------------------------------------
  test('4. POST /api/v1/auth/register', async () => {
    try {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          phoneNumber: testPhone,
          name: 'Automated Test User',
          email: testEmail,
          password: testPassword,
          role: 'user'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.userId || res.body.data?.id || res.body.data?.user?.id).toBeDefined();

      createdUserId = res.body.data?.userId || res.body.data?.id || res.body.data?.user?.id;

      // Verify side effects in database
      const dbUser = await User.findByPk(createdUserId);
      expect(dbUser).not.toBeNull();
      recordResult('User persisted', 'DATABASE', true);

      const dbWallet = await Wallet.findOne({ where: { userId: createdUserId } });
      expect(dbWallet).not.toBeNull();
      recordResult('Wallet persisted', 'DATABASE', true);

      const dbVerification = await Verification.findOne({
        where: { phoneNumber: testPhone, otpType: 'verify_phone', isUsed: false }
      });
      expect(dbVerification).not.toBeNull();
      recordResult('Verification persisted', 'DATABASE', true);

      recordResult('POST /api/v1/auth/register', 'AUTHENTICATION', true);
    } catch (err) {
      recordResult('POST /api/v1/auth/register', 'AUTHENTICATION', false, err.message);
      throw err;
    }
  });

  test('4b. POST /api/v1/auth/register (Admin Registration)', async () => {
    try {
      const adminPhone = `+9198${Date.now().toString().slice(-8)}`;
      const adminEmail = `admin-test-${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          phoneNumber: adminPhone,
          name: 'Automated Test Admin',
          email: adminEmail,
          password: testPassword,
          role: 'admin'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.userId).toBeDefined();

      const adminId = res.body.data.userId;
      const dbUser = await User.findByPk(adminId);
      expect(dbUser).not.toBeNull();
      expect(dbUser.role).toBe('admin');

      // Cleanup
      await Verification.destroy({ where: { userId: adminId } }).catch(() => {});
      await Wallet.destroy({ where: { userId: adminId } }).catch(() => {});
      await User.destroy({ where: { id: adminId } }).catch(() => {});
      recordResult('POST /api/v1/auth/register (Admin)', 'AUTHENTICATION', true);
    } catch (err) {
      recordResult('POST /api/v1/auth/register (Admin)', 'AUTHENTICATION', false, err.message);
      throw err;
    }
  });

  test('5. POST /api/v1/auth/otp/verify', async () => {
    try {
      // Cleanly retrieve OTP directly from DB for test assertion
      const verificationRecord = await Verification.findOne({
        where: { phoneNumber: testPhone, otpType: 'verify_phone', isUsed: false }
      });

      expect(verificationRecord).not.toBeNull();
      const otpCode = verificationRecord.otpCode;

      const res = await request(app)
        .post('/api/v1/auth/otp/verify')
        .send({
          phoneNumber: testPhone,
          code: otpCode,
          type: 'verify_phone',
          name: 'Automated Test User'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.accessToken).toBeDefined();
      expect(res.body.data?.refreshToken).toBeDefined();

      accessToken = res.body.data?.accessToken;
      refreshToken = res.body.data?.refreshToken;

      // Verify DB side effects
      const updatedUser = await User.findByPk(createdUserId);
      expect(updatedUser.isVerified).toBe(true);
      recordResult('User marked as verified', 'DATABASE', true);

      const updatedVerification = await Verification.findByPk(verificationRecord.id);
      expect(updatedVerification.isUsed).toBe(true);
      recordResult('OTP marked as used', 'DATABASE', true);

      recordResult('POST /api/v1/auth/otp/verify', 'AUTHENTICATION', true);
    } catch (err) {
      recordResult('POST /api/v1/auth/otp/verify', 'AUTHENTICATION', false, err.message);
      throw err;
    }
  });

  test('6. GET /api/v1/auth/profile (Authenticated)', async () => {
    try {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.id).toBe(createdUserId);

      const profile = res.body.data;
      expect(profile.passwordHash).toBeUndefined();
      expect(profile.password_hash).toBeUndefined();
      expect(profile.refreshToken).toBeUndefined();
      expect(profile.refresh_token).toBeUndefined();

      recordResult('GET /api/v1/auth/profile', 'AUTHENTICATION', true);
    } catch (err) {
      recordResult('GET /api/v1/auth/profile', 'AUTHENTICATION', false, err.message);
      throw err;
    }
  });

  test('7. POST /api/v1/auth/refresh-token', async () => {
    try {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ token: refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.accessToken).toBeDefined();

      recordResult('POST /api/v1/auth/refresh-token', 'AUTHENTICATION', true);
    } catch (err) {
      recordResult('POST /api/v1/auth/refresh-token', 'AUTHENTICATION', false, err.message);
      throw err;
    }
  });

  test('8. POST /api/v1/auth/login (Password Login)', async () => {
    try {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          emailOrPhone: testEmail,
          password: testPassword
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.accessToken).toBeDefined();
      expect(res.body.data?.refreshToken).toBeDefined();

      recordResult('POST /api/v1/auth/login', 'AUTHENTICATION', true);
    } catch (err) {
      recordResult('POST /api/v1/auth/login', 'AUTHENTICATION', false, err.message);
      throw err;
    }
  });

  // --------------------------------------------------
  // 3. SECURITY REJECTIONS
  // --------------------------------------------------
  test('9. Reject unauthenticated profile request', async () => {
    try {
      const res = await request(app).get('/api/v1/auth/profile');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      recordResult('Reject unauthenticated profile', 'SECURITY', true);
    } catch (err) {
      recordResult('Reject unauthenticated profile', 'SECURITY', false, err.message);
      throw err;
    }
  });

  test('10. Reject invalid JWT', async () => {
    try {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid.jwt.token');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      recordResult('Reject invalid JWT', 'SECURITY', true);
    } catch (err) {
      recordResult('Reject invalid JWT', 'SECURITY', false, err.message);
      throw err;
    }
  });

  test('11. Reject invalid password login', async () => {
    try {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          emailOrPhone: testEmail,
          password: 'WrongPassword123!'
        });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      recordResult('Reject invalid password', 'SECURITY', true);
    } catch (err) {
      recordResult('Reject invalid password', 'SECURITY', false, err.message);
      throw err;
    }
  });

  test('12. Reject invalid refresh token', async () => {
    try {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ token: 'invalid-refresh-token' });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      recordResult('Reject invalid refresh token', 'SECURITY', true);
    } catch (err) {
      recordResult('Reject invalid refresh token', 'SECURITY', false, err.message);
      throw err;
    }
  });
});
