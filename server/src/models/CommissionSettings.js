import mongoose from 'mongoose';

const commissionSettingsSchema = new mongoose.Schema(
  {
    defaultPercentage: {
      type: Number,
      required: true,
      default: 5.0,
      min: 0,
      max: 100,
    },
    categoryOverrides: [
      {
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        percentage: { type: Number, required: true },
      },
    ],
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const CommissionSettings = mongoose.model('CommissionSettings', commissionSettingsSchema);
