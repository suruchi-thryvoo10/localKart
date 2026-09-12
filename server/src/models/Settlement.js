import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    totalOrders: { type: Number, required: true },
    grossSales: { type: Number, required: true },
    platformCommissionDeducted: { type: Number, required: true },
    netPayoutAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSED', 'FAILED'],
      default: 'PROCESSED',
    },
    payoutMethod: {
      type: String,
      enum: ['BANK_TRANSFER', 'UPI', 'CASH_SETTLEMENT'],
      default: 'UPI',
    },
    referenceNumber: {
      type: String,
      default: () => 'SETTLE-' + Date.now(),
    },
    settledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Settlement = mongoose.model('Settlement', settlementSchema);
