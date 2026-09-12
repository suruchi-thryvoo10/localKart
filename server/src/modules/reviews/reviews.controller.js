import { Review, Order, Vendor } from '../../models/index.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment = '', tags = [] } = req.body;

    const order = await Order.findOne({ _id: orderId, customerId: req.user._id });
    if (!order) return errorResponse(res, 'Order not found or does not belong to you', 404);

    if (order.status !== 'DELIVERED') {
      return errorResponse(res, 'You can only review an order after it has been delivered', 400);
    }

    if (order.hasCustomerReviewed) {
      return errorResponse(res, 'You have already reviewed this order', 400);
    }

    const review = await Review.create({
      orderId: order._id,
      customerId: req.user._id,
      vendorId: order.vendorId,
      customerName: req.user.name,
      rating: Number(rating),
      comment,
      tags,
      isVerifiedPurchase: true,
    });

    order.hasCustomerReviewed = true;
    await order.save();

    // Recalculate Vendor average rating
    const allVendorReviews = await Review.find({ vendorId: order.vendorId });
    const avgRating = allVendorReviews.reduce((sum, r) => sum + r.rating, 0) / allVendorReviews.length;

    await Vendor.findByIdAndUpdate(order.vendorId, {
      rating: Math.round(avgRating * 10) / 10,
      totalRatings: allVendorReviews.length,
    });

    return successResponse(res, 'Review submitted successfully! ⭐', review, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getVendorReviews = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const reviews = await Review.find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(50);

    return successResponse(res, 'Vendor reviews retrieved', reviews);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
