import {
  User,
  Vendor,
  Order,
  DeliveryAgent,
  Product,
  CommissionSettings,
  Settlement,
} from '../../models/index.js';
import { cache } from '../../cache/redis.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const getPlatformMetrics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      approvedVendors,
      pendingVendors,
      totalDeliveryAgents,
      totalOrders,
      orders,
    ] = await Promise.all([
      User.countDocuments({ role: 'CUSTOMER' }),
      Vendor.countDocuments(),
      Vendor.countDocuments({ status: 'APPROVED' }),
      Vendor.countDocuments({ status: 'PENDING' }),
      DeliveryAgent.countDocuments(),
      Order.countDocuments(),
      Order.find({ status: { $nin: ['CANCELLED', 'REJECTED'] } }),
    ]);

    const totalGMV = orders.reduce((sum, o) => sum + (o.pricing?.finalAmount || 0), 0);
    const platformRevenue = orders.reduce((sum, o) => sum + (o.pricing?.platformCommissionAmount || 0), 0);
    const totalVendorEarnings = orders.reduce((sum, o) => sum + (o.pricing?.vendorEarnings || 0), 0);

    const activeOrdersCount = await Order.countDocuments({
      status: { $in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'] },
    });

    const deliveredOrdersCount = await Order.countDocuments({ status: 'DELIVERED' });

    return successResponse(res, 'Platform metrics retrieved', {
      totalGMV: Math.round(totalGMV * 100) / 100,
      platformRevenue: Math.round(platformRevenue * 100) / 100,
      totalVendorEarnings: Math.round(totalVendorEarnings * 100) / 100,
      totalOrders,
      activeOrdersCount,
      deliveredOrdersCount,
      totalUsers,
      totalVendors,
      approvedVendors,
      pendingVendors,
      totalDeliveryAgents,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getAllVendors = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { shopName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const vendors = await Vendor.find(query).populate('userId', 'name email phone').sort({ createdAt: -1 });
    return successResponse(res, 'Vendors retrieved', vendors);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateVendorStatus = async (req, res) => {
  try {
    const { status, commissionPercentage } = req.body;
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return errorResponse(res, 'Vendor not found', 404);

    if (status) vendor.status = status;
    if (commissionPercentage !== undefined) vendor.commissionPercentage = Number(commissionPercentage);

    await vendor.save();
    await cache.delPattern('vendors:nearby:*');

    return successResponse(res, `Vendor status updated to ${vendor.status}`, vendor);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('vendorId', 'shopName phone address')
        .populate('customerId', 'name phone email')
        .populate('deliveryAgentId', 'name phone vehicleType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    return successResponse(res, 'All orders retrieved', {
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query).select('-password -refreshTokens').sort({ createdAt: -1 });
    return successResponse(res, 'Users retrieved', users);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);

    user.isActive = !user.isActive;
    await user.save();

    return successResponse(res, `User is now ${user.isActive ? 'Active' : 'Suspended'}`, user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find()
      .populate('vendorId', 'shopName phone ownerName')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Settlements retrieved', settlements);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const generateSettlement = async (req, res) => {
  try {
    const { vendorId, periodStart, periodEnd } = req.body;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return errorResponse(res, 'Vendor not found', 404);

    const orders = await Order.find({
      vendorId,
      status: 'DELIVERED',
      deliveredAt: { $gte: new Date(periodStart), $lte: new Date(periodEnd) },
    });

    const grossSales = orders.reduce((sum, o) => sum + (o.pricing?.itemsTotal || 0), 0);
    const platformCommissionDeducted = orders.reduce((sum, o) => sum + (o.pricing?.platformCommissionAmount || 0), 0);
    const netPayoutAmount = orders.reduce((sum, o) => sum + (o.pricing?.vendorEarnings || 0), 0);

    const settlement = await Settlement.create({
      vendorId,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      totalOrders: orders.length,
      grossSales: Math.round(grossSales * 100) / 100,
      platformCommissionDeducted: Math.round(platformCommissionDeducted * 100) / 100,
      netPayoutAmount: Math.round(netPayoutAmount * 100) / 100,
      status: 'PROCESSED',
    });

    return successResponse(res, 'Settlement generated successfully', settlement, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
