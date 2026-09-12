import mongoose from 'mongoose';
import { config } from '../config/index.js';

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: Object.values(config.paymentMethod),
      default: config.paymentMethod.ONLINE,
    },
    paymentGateway: {
      type: String,
      enum: ['SIMULATED_RAZORPAY', 'RAZORPAY', 'UPI', 'COD'],
      default: 'SIMULATED_RAZORPAY',
    },
    status: {
      type: String,
      enum: Object.values(config.paymentStatus),
      default: config.paymentStatus.PENDING,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model('Payment', paymentSchema);
