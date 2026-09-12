import jwt from 'jsonwebtoken';
import { User, Vendor, DeliveryAgent } from '../../models/index.js';
import { config } from '../../config/index.js';
import { successResponse, errorResponse } from '../../utils/response.js';

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role = config.roles.CUSTOMER, preferredLanguage = 'en', shopDetails, vehicleDetails } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'Email is already registered', 409, null, 'ERR_EMAIL_EXISTS');
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role,
      preferredLanguage,
    });

    const tokens = generateTokens(user);
    user.refreshTokens = [tokens.refreshToken];
    await user.save();

    // If role is VENDOR, create initial Vendor profile
    let vendorProfile = null;
    if (role === config.roles.VENDOR) {
      vendorProfile = await Vendor.create({
        userId: user._id,
        shopName: shopDetails?.shopName || `${name}'s Fresh Store`,
        ownerName: name,
        phone: phone,
        email: email,
        shopType: shopDetails?.shopType || 'VEGETABLES',
        description: shopDetails?.description || 'Fresh Vegetables & Grocery direct from local market',
        location: shopDetails?.location || {
          type: 'Point',
          coordinates: [85.8245, 20.2961],
        },
        address: shopDetails?.address || {
          street: 'Main Market Road',
          area: 'Saheed Nagar',
          city: 'Bhubaneswar',
          state: 'Odisha',
          pincode: '751007',
        },
        deliveryRadiusKm: shopDetails?.deliveryRadiusKm || 5,
        status: 'APPROVED',
      });
    }

    // If role is DELIVERY_AGENT, create DeliveryAgent record if vendor specified or general
    let agentProfile = null;
    if (role === config.roles.DELIVERY_AGENT) {
      // Find default or first vendor if not specified
      const vendor = await Vendor.findOne();
      agentProfile = await DeliveryAgent.create({
        userId: user._id,
        vendorId: vehicleDetails?.vendorId || vendor?._id,
        name: name,
        phone: phone,
        vehicleType: vehicleDetails?.vehicleType || 'MOTORCYCLE',
        vehicleNumber: vehicleDetails?.vehicleNumber || 'OD-02-AB-1234',
        isAvailable: true,
      });
    }

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;

    return successResponse(
      res,
      'Registration successful',
      {
        user: userResponse,
        vendor: vendorProfile,
        deliveryAgent: agentProfile,
        tokens,
      },
      201
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokens');
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401, null, 'ERR_INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401, null, 'ERR_INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account has been deactivated. Please contact support.', 403, null, 'ERR_ACCOUNT_DISABLED');
    }

    const tokens = generateTokens(user);

    // Keep max 5 refresh tokens per user for multi-device support
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), tokens.refreshToken];
    await user.save();

    let vendor = null;
    let deliveryAgent = null;

    if (user.role === config.roles.VENDOR) {
      vendor = await Vendor.findOne({ userId: user._id });
    } else if (user.role === config.roles.DELIVERY_AGENT) {
      deliveryAgent = await DeliveryAgent.findOne({ userId: user._id }).populate('vendorId', 'shopName phone');
    }

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;

    return successResponse(res, 'Login successful', {
      user: userResponse,
      vendor,
      deliveryAgent,
      tokens,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, 'Refresh token required', 400);
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return errorResponse(res, 'Invalid or revoked refresh token', 401, null, 'ERR_INVALID_REFRESH_TOKEN');
    }

    // Rotate refresh token
    const newTokens = generateTokens(user);
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(newTokens.refreshToken);
    await user.save();

    return successResponse(res, 'Token refreshed successfully', {
      tokens: newTokens,
    });
  } catch (error) {
    return errorResponse(res, 'Invalid refresh token', 401, null, 'ERR_INVALID_REFRESH_TOKEN');
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken && req.user) {
      const user = await User.findById(req.user._id).select('+refreshTokens');
      if (user) {
        user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== refreshToken);
        await user.save();
      }
    }
    return successResponse(res, 'Logged out successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let vendor = null;
    let deliveryAgent = null;

    if (user.role === config.roles.VENDOR) {
      vendor = await Vendor.findOne({ userId: user._id });
    } else if (user.role === config.roles.DELIVERY_AGENT) {
      deliveryAgent = await DeliveryAgent.findOne({ userId: user._id }).populate('vendorId', 'shopName phone');
    }

    return successResponse(res, 'Current user profile', {
      user,
      vendor,
      deliveryAgent,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
