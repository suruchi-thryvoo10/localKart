import { Coupon } from '../../models/Coupon.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      validUntil: { $gte: new Date() },
    }).sort({ minOrderAmount: 1 });

    return successResponse(res, 'Active coupons retrieved', coupons);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    return successResponse(res, 'Coupon created successfully', coupon, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return errorResponse(res, 'Coupon not found', 404);
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return successResponse(res, `Coupon is now ${coupon.isActive ? 'Active' : 'Inactive'}`, coupon);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
