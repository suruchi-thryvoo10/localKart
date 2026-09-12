import mongoose from 'mongoose';
import { config } from '../config/index.js';

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    shopName: {
      type: String,
      required: [true, 'Please provide shop name'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Please provide owner name'],
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    shopType: {
      type: String,
      enum: ['GROCERY', 'VEGETABLES', 'FRUITS', 'DAIRY', 'ORGANIC_PRODUCE', 'SUPERMARKET'],
      default: 'VEGETABLES',
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
    },
    banner: {
      type: String,
      default: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1000&q=80',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere',
      },
    },
    address: {
      street: { type: String, required: true },
      area: { type: String, required: true },
      landmark: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    deliveryRadiusKm: {
      type: Number,
      default: 5,
      min: 1,
      max: 30,
    },
    minOrderAmount: {
      type: Number,
      default: 50,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 25,
      min: 0,
    },
    freeDeliveryAbove: {
      type: Number,
      default: 300,
    },
    openingTime: {
      type: String,
      default: '06:00', // 24hr format
    },
    closingTime: {
      type: String,
      default: '21:00',
    },
    weeklyOffDays: {
      type: [String],
      default: [],
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: config.vendorStatus,
      default: 'APPROVED',
    },
    commissionPercentage: {
      type: Number,
      default: 5,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    featuredToday: {
      type: Boolean,
      default: true,
    },
    hasFreshStockToday: {
      type: Boolean,
      default: true,
    },
    freshStockUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

vendorSchema.index({ location: '2dsphere' });
vendorSchema.index({ shopName: 'text', description: 'text', 'address.area': 'text' });

export const Vendor = mongoose.model('Vendor', vendorSchema);
