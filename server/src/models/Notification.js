import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['ORDER_UPDATE', 'PROMOTION', 'VENDOR_ALERT', 'DELIVERY_ALERT', 'SYSTEM'],
      default: 'ORDER_UPDATE',
    },
    metadata: {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
      url: { type: String, default: '' },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
