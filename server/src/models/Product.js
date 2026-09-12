import mongoose from 'mongoose';
import { config } from '../config/index.js';

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    name: {
      en: { type: String, required: true, trim: true },
      hi: { type: String, default: '', trim: true },
      od: { type: String, default: '', trim: true },
    },
    description: {
      en: { type: String, default: '' },
      hi: { type: String, default: '' },
      od: { type: String, default: '' },
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 90,
    },
    unit: {
      type: String,
      enum: config.productUnits,
      default: 'kg',
    },
    unitQuantity: {
      type: Number,
      default: 1, // e.g. 1 kg, 500 grams, 1 dozen
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: 0,
      default: 50,
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxOrderQuantity: {
      type: Number,
      default: 20,
    },
    images: {
      type: [String],
      default: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'],
    },
    freshnessStatus: {
      type: String,
      enum: config.freshnessStatus,
      default: 'FRESH_TODAY',
    },
    badge: {
      type: String,
      enum: ['FRESH_HARVEST', 'BESTSELLER', 'SEASONAL', 'ORGANIC', 'LOCAL_SPECIAL', 'DISCOUNTED', 'NONE'],
      default: 'FRESH_HARVEST',
    },
    harvestedDate: {
      type: String, // e.g. "Today Morning 5:00 AM" or ISO Date
      default: 'Today Morning 5:30 AM',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for effective final unit price after discount
productSchema.virtual('finalPrice').get(function () {
  if (!this.discountPercent || this.discountPercent <= 0) return this.price;
  const discounted = this.price - (this.price * this.discountPercent) / 100;
  return Math.round(discounted * 100) / 100;
});

productSchema.index({ vendorId: 1, categoryId: 1 });
productSchema.index({ 'name.en': 'text', 'name.hi': 'text', 'name.od': 'text', tags: 'text' });
productSchema.index({ freshnessStatus: 1 });
productSchema.index({ isAvailable: 1 });

export const Product = mongoose.model('Product', productSchema);
