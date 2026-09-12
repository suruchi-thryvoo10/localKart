import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/index.js';
import { cache } from './cache/redis.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';

// Import Route Handlers
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import vendorsRoutes from './modules/vendors/vendors.routes.js';
import productsRoutes from './modules/products/products.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import deliveryRoutes from './modules/delivery/delivery.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import reviewsRoutes from './modules/reviews/reviews.routes.js';
import couponsRoutes from './modules/coupons/coupons.routes.js';
import complaintsRoutes from './modules/complaints/complaints.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// Security and compression middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: config.corsOrigin === '*' ? true : config.corsOrigin,
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (!config.isTest) {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
}

// Health Check Endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    environment: config.nodeEnv,
    cache: cache.getStatus(),
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    version: '1.0.0',
    service: 'LocalKart Hyperlocal API',
    instanceId: process.env.INSTANCE_ID || 'instance-1',
    timestamp: new Date().toISOString(),
    cache: cache.getStatus(),
  });
});

// Rate limiting for API v1
app.use('/api/', apiLimiter);

// Mount API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/vendors', vendorsRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/reviews', reviewsRoutes);
app.use('/api/v1/coupons', couponsRoutes);
app.use('/api/v1/complaints', complaintsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
