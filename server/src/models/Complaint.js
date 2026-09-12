import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
    subject: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['DAMAGED_ITEM', 'MISSING_ITEM', 'WRONG_ITEM', 'DELIVERY_DELAY', 'OVERCHARGED', 'QUALITY_ISSUE', 'OTHER'],
      default: 'QUALITY_ISSUE',
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'],
      default: 'OPEN',
    },
    resolutionNote: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Complaint = mongoose.model('Complaint', complaintSchema);
