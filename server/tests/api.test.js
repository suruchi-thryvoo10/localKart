import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { Category, Vendor, Product, User, CommissionSettings } from '../src/models/index.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('LocalKart Hyperlocal API Test Suite', () => {
  let customerToken = '';
  let customerId = '';
  let vendorToken = '';
  let vendorId = '';
  let categoryId = '';
  let productId = '';
  let adminToken = '';

  beforeEach(async () => {
    // optional reset if needed
  });

  describe('1. Health Check Endpoint', () => {
    it('should return UP status on /health and /api/v1/health', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');

      const resApi = await request(app).get('/api/v1/health');
      expect(resApi.status).toBe(200);
      expect(resApi.body.status).toBe('UP');
    });
  });

  describe('2. Authentication & RBAC Flow', () => {
    it('should register a new customer', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test Customer',
        email: 'testcustomer@localkart.com',
        phone: '9861000000',
        password: 'Password@123',
        role: 'CUSTOMER',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      customerToken = res.body.data.tokens.accessToken;
      customerId = res.body.data.user._id;
    });

    it('should register a new vendor and create vendor profile', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test Vendor Owner',
        email: 'testvendor@localkart.com',
        phone: '9437000000',
        password: 'Password@123',
        role: 'VENDOR',
        shopDetails: {
          shopName: 'Test Fresh Sabzi Mandi',
          shopType: 'VEGETABLES',
          deliveryRadiusKm: 5,
          location: {
            type: 'Point',
            coordinates: [85.8245, 20.2961],
          },
        },
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vendor).toBeDefined();
      expect(res.body.data.vendor.shopName).toBe('Test Fresh Sabzi Mandi');
      vendorToken = res.body.data.tokens.accessToken;
      vendorId = res.body.data.vendor._id;
    });

    it('should register an admin user', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Super Admin',
        email: 'admin@localkart.com',
        phone: '9999999999',
        password: 'AdminPassword@123',
        role: 'ADMIN',
      });

      expect(res.status).toBe(201);
      adminToken = res.body.data.tokens.accessToken;
    });

    it('should reject invalid login credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'testcustomer@localkart.com',
        password: 'WrongPassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should log in successfully with valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'testcustomer@localkart.com',
        password: 'Password@123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });
  });

  describe('3. Category & Product Management', () => {
    it('should allow admin to create a category', async () => {
      const res = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: { en: 'Organic Vegetables', hi: 'जैविक सब्जियां', od: 'ଜୈବିକ ପନିପରିବା' },
          slug: 'organic-veggies',
          icon: 'Leaf',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      categoryId = res.body.data._id;
    });

    it('should allow vendor to create a fresh product', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          categoryId,
          name: { en: 'Desi Fresh Tomato', hi: 'देसी टमाटर', od: 'ଦେଶୀ ଟମାଟୋ' },
          price: 40,
          discountPercent: 10,
          unit: 'kg',
          stockQuantity: 50,
          freshnessStatus: 'FRESH_TODAY',
          badge: 'FRESH_HARVEST',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(40);
      productId = res.body.data._id;
    });

    it('should retrieve nearby vendors via geospatial query', async () => {
      const res = await request(app).get('/api/v1/vendors/nearby?lat=20.2961&lng=85.8245&radius=10');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('4. Cart & Single-Vendor Isolation', () => {
    it('should add product to customer cart', async () => {
      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId,
          quantity: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cart.items.length).toBe(1);
      expect(res.body.data.cart.items[0].quantity).toBe(2);
    });

    it('should calculate cart subtotal and summary correctly', async () => {
      const res = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.subtotal).toBe(72); // 40 - 10% = 36 * 2 = 72
      expect(res.body.data.summary.itemCount).toBe(2);
    });
  });

  describe('5. Order Lifecycle & Atomic Stock Decrement', () => {
    let orderId = '';
    let deliveryOtp = '';

    it('should create order and atomically decrement product stock', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          deliveryAddress: {
            recipientName: 'Rahul Test',
            phone: '9861000000',
            streetAddress: 'Plot 10, Saheed Nagar',
            city: 'Bhubaneswar',
            state: 'Odisha',
            pincode: '751007',
          },
          paymentMethod: 'COD',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.deliveryOtp).toBeDefined();

      orderId = res.body.data._id;
      deliveryOtp = res.body.data.deliveryOtp;

      // Verify stock was decremented from 50 to 48
      const updatedProduct = await Product.findById(productId);
      expect(updatedProduct.stockQuantity).toBe(48);
    });

    it('should allow vendor to accept and prepare the order', async () => {
      const acceptRes = await request(app)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ status: 'ACCEPTED' });

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.data.status).toBe('ACCEPTED');

      const prepareRes = await request(app)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ status: 'PREPARING' });

      expect(prepareRes.status).toBe(200);
      expect(prepareRes.body.data.status).toBe('PREPARING');
    });

    it('should reject delivery completion with incorrect OTP', async () => {
      // Create a delivery agent for vendor
      const agentRes = await request(app)
        .post('/api/v1/vendors/me/delivery-agents')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          name: 'Raju Delivery',
          phone: '9777999999',
          email: 'rajudelivery@localkart.com',
          vehicleType: 'MOTORCYCLE',
        });

      expect(agentRes.status).toBe(201);

      // Transition order to OUT_FOR_DELIVERY
      await request(app)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ status: 'OUT_FOR_DELIVERY' });

      // Attempt complete with wrong OTP
      const wrongOtpRes = await request(app)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ status: 'DELIVERED', otp: '9999' });

      expect(wrongOtpRes.status).toBe(400);
      expect(wrongOtpRes.body.code).toBe('ERR_INVALID_OTP');
    });

    it('should complete delivery with correct 4-digit OTP', async () => {
      const deliveredRes = await request(app)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ status: 'DELIVERED', otp: deliveryOtp });

      expect(deliveredRes.status).toBe(200);
      expect(deliveredRes.body.data.status).toBe('DELIVERED');
      expect(deliveredRes.body.data.payment.status).toBe('PAID');
    });
  });

  describe('6. Admin Platform Metrics', () => {
    it('should retrieve overall platform revenue and metrics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalOrders).toBe(1);
      expect(res.body.data.deliveredOrdersCount).toBe(1);
      expect(res.body.data.platformRevenue).toBeGreaterThan(0);
    });
  });
});
