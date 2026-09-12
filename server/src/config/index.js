import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/localkart',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwt: {
    secret: process.env.JWT_SECRET || 'localkart_default_jwt_secret_key_change_in_prod',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'localkart_default_jwt_refresh_secret_key_change_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  corsOrigin: process.env.CORS_ORIGIN || '*',
  platformCommissionPercentage: parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || '5'),
  defaultDeliveryRadiusKm: parseFloat(process.env.DEFAULT_DELIVERY_RADIUS_KM || '10'),
  defaultDeliveryFee: parseFloat(process.env.DEFAULT_DELIVERY_FEE || '30'),
  freeDeliveryThreshold: parseFloat(process.env.FREE_DELIVERY_THRESHOLD || '500'),
  roles: {
    CUSTOMER: 'CUSTOMER',
    VENDOR: 'VENDOR',
    DELIVERY_AGENT: 'DELIVERY_AGENT',
    ADMIN: 'ADMIN',
  },
  orderStatus: {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    PREPARING: 'PREPARING',
    READY_FOR_PICKUP: 'READY_FOR_PICKUP',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    REJECTED: 'REJECTED',
  },
  paymentStatus: {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
  },
  paymentMethod: {
    ONLINE: 'ONLINE',
    COD: 'COD',
  },
  productUnits: ['kg', 'gram', 'litre', 'ml', 'piece', 'packet', 'dozen', 'bundle'],
  freshnessStatus: ['FRESH_TODAY', 'AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK'],
  vendorStatus: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
  supportedLanguages: ['en', 'hi', 'od'],
};
