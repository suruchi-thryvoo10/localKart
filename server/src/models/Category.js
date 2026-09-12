import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      hi: { type: String, required: true },
      od: { type: String, required: true },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'ShoppingBag',
    },
    image: {
      type: String,
      default: '',
    },
    displayOrder: {
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

categorySchema.index({ displayOrder: 1 });

export const Category = mongoose.model('Category', categorySchema);
