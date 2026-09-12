import mongoose from 'mongoose';

const deliveryAgentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['BICYCLE', 'MOTORCYCLE', 'SCOOTER', 'EV_SCOOTER', 'ON_FOOT'],
      default: 'MOTORCYCLE',
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    activeOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    completedDeliveries: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

deliveryAgentSchema.index({ vendorId: 1, isAvailable: 1 });

export const DeliveryAgent = mongoose.model('DeliveryAgent', deliveryAgentSchema);
