import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FLAT'],
      default: 'PERCENTAGE',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: 100, // Caps percentage discounts
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    usageLimit: {
      type: Number,
      default: 10000,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.methods.calculateDiscount = function (subtotal) {
  if (subtotal < this.minOrderAmount) return 0;

  if (this.discountType === 'FLAT') {
    return Math.min(this.discountValue, subtotal);
  } else {
    // Percentage
    const calculated = (subtotal * this.discountValue) / 100;
    return Math.min(calculated, this.maxDiscountAmount || calculated);
  }
};

export const Coupon = mongoose.model('Coupon', couponSchema);
