import mongoose from 'mongoose';
import { config } from '../config/index.js';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    quantity: { type: Number, required: true },
    total: { type: Number, required: true },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(config.orderStatus),
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    deliveryAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryAgent',
      default: null,
      index: true,
    },
    items: [orderItemSchema],
    pricing: {
      itemsTotal: { type: Number, required: true },
      deliveryFee: { type: Number, default: 0 },
      couponDiscount: { type: Number, default: 0 },
      platformCommissionPercentage: { type: Number, default: 5 },
      platformCommissionAmount: { type: Number, default: 0 },
      vendorEarnings: { type: Number, required: true },
      finalAmount: { type: Number, required: true },
    },
    couponCode: {
      type: String,
      default: null,
    },
    deliveryAddress: {
      recipientName: { type: String, required: true },
      phone: { type: String, required: true },
      streetAddress: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: {
        type: [Number],
        default: [85.8245, 20.2961],
      },
    },
    payment: {
      method: {
        type: String,
        enum: Object.values(config.paymentMethod),
        default: config.paymentMethod.COD,
      },
      status: {
        type: String,
        enum: Object.values(config.paymentStatus),
        default: config.paymentStatus.PENDING,
      },
      transactionId: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: Object.values(config.orderStatus),
      default: config.orderStatus.PENDING,
      index: true,
    },
    statusHistory: [statusHistorySchema],
    deliveryOtp: {
      type: String,
      required: true,
    },
    customerNotes: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    estimatedDeliveryTime: {
      type: String,
      default: '25-35 mins',
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    hasCustomerReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
orderSchema.index({ deliveryAgentId: 1, status: 1 });

export const Order = mongoose.model('Order', orderSchema);
