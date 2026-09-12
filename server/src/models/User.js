import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';

const addressSchema = new mongoose.Schema(
  {
    tag: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Home',
    },
    recipientName: { type: String, required: true },
    phone: { type: String, required: true },
    streetAddress: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [85.8245, 20.2961], // Default to Bhubaneswar / Indian coordinates
      },
    },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(config.roles),
      default: config.roles.CUSTOMER,
    },
    preferredLanguage: {
      type: String,
      enum: config.supportedLanguages,
      default: 'en',
    },
    addresses: [addressSchema],
    refreshTokens: [{ type: String, select: false }],
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
