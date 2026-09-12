import { Vendor, Product, Order, DeliveryAgent, User } from '../../models/index.js';
import { cache } from '../../cache/redis.js';
import { calculateDistanceKm } from '../../utils/haversine.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const getNearbyVendors = async (req, res) => {
  try {
    const {
      lat = 20.2961,
      lng = 85.8245,
      radius = 10,
      shopType,
      freshOnly,
      search,
    } = req.query;

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadiusKm = parseFloat(radius);

    const cacheKey = `vendors:nearby:${userLat.toFixed(3)}:${userLng.toFixed(3)}:${maxRadiusKm}:${shopType || 'all'}:${freshOnly || 'all'}:${search || ''}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return successResponse(res, 'Nearby vendors retrieved from cache', cached);
    }

    const query = {
      status: 'APPROVED',
      isOpen: true,
    };

    if (shopType) {
      query.shopType = shopType;
    }

    if (freshOnly === 'true' || freshOnly === true) {
      query.hasFreshStockToday = true;
    }

    if (search) {
      query.$or = [
        { shopName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.area': { $regex: search, $options: 'i' } },
      ];
    }

    const allVendors = await Vendor.find(query);

    // Compute distance and filter by vendor's delivery radius
    const vendorsWithDistance = allVendors
      .map((vendor) => {
        const [vLng, vLat] = vendor.location.coordinates || [85.8245, 20.2961];
        const distanceKm = calculateDistanceKm(userLat, userLng, vLat, vLng);
        const isDeliverable = distanceKm <= (vendor.deliveryRadiusKm || maxRadiusKm);

        return {
          ...vendor.toObject(),
          distanceKm,
          isDeliverable,
        };
      })
      .filter((vendor) => vendor.distanceKm <= maxRadiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    await cache.set(cacheKey, vendorsWithDistance, 60); // 1 min TTL

    return successResponse(res, 'Nearby vendors retrieved', vendorsWithDistance);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id);
    if (!vendor) return errorResponse(res, 'Vendor not found', 404);

    return successResponse(res, 'Vendor details', vendor);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getMyVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) return errorResponse(res, 'Vendor profile not found', 404);

    return successResponse(res, 'Vendor profile', vendor);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateVendorProfile = async (req, res) => {
  try {
    let vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor && req.user.role === 'ADMIN' && req.params.id) {
      vendor = await Vendor.findById(req.params.id);
    }
    if (!vendor) return errorResponse(res, 'Vendor not found', 404);

    const allowedUpdates = [
      'shopName',
      'ownerName',
      'phone',
      'email',
      'description',
      'shopType',
      'logo',
      'banner',
      'address',
      'deliveryRadiusKm',
      'minOrderAmount',
      'deliveryFee',
      'freeDeliveryAbove',
      'openingTime',
      'closingTime',
      'weeklyOffDays',
      'location',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        vendor[field] = req.body[field];
      }
    });

    await vendor.save();
    await cache.delPattern('vendors:nearby:*');

    return successResponse(res, 'Vendor profile updated successfully', vendor);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const toggleOpenStatus = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) return errorResponse(res, 'Vendor profile not found', 404);

    vendor.isOpen = req.body.isOpen !== undefined ? req.body.isOpen : !vendor.isOpen;
    await vendor.save();
    await cache.delPattern('vendors:nearby:*');

    return successResponse(res, `Shop is now ${vendor.isOpen ? 'OPEN' : 'CLOSED'}`, vendor);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const toggleFreshStockToday = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) return errorResponse(res, 'Vendor profile not found', 404);

    vendor.hasFreshStockToday = req.body.hasFreshStockToday !== undefined ? req.body.hasFreshStockToday : !vendor.hasFreshStockToday;
    vendor.freshStockUpdatedAt = new Date();
    await vendor.save();
    await cache.delPattern('vendors:nearby:*');

    return successResponse(
      res,
      vendor.hasFreshStockToday ? '🥬 Marked as Fresh Stock Available Today!' : 'Fresh stock badge removed',
      vendor
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getVendorDashboardStats = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) return errorResponse(res, 'Vendor not found', 404);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todayOrders, pendingOrders, preparingOrders, readyOrders, totalProducts, freshProducts, deliveryAgents] = await Promise.all([
      Order.find({ vendorId: vendor._id, createdAt: { $gte: todayStart } }),
      Order.countDocuments({ vendorId: vendor._id, status: 'PENDING' }),
      Order.countDocuments({ vendorId: vendor._id, status: 'PREPARING' }),
      Order.countDocuments({ vendorId: vendor._id, status: 'READY_FOR_PICKUP' }),
      Product.countDocuments({ vendorId: vendor._id }),
      Product.countDocuments({ vendorId: vendor._id, freshnessStatus: 'FRESH_TODAY' }),
      DeliveryAgent.find({ vendorId: vendor._id }),
    ]);

    const todayRevenue = todayOrders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
      .reduce((sum, o) => sum + (o.pricing?.vendorEarnings || 0), 0);

    return successResponse(res, 'Dashboard statistics', {
      vendor,
      stats: {
        todayOrdersCount: todayOrders.length,
        todayRevenue,
        pendingOrders,
        preparingOrders,
        readyOrders,
        activeOrdersCount: pendingOrders + preparingOrders + readyOrders,
        totalProducts,
        freshProducts,
        totalDeliveryAgents: deliveryAgents.length,
        availableDeliveryAgents: deliveryAgents.filter((a) => a.isAvailable).length,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getVendorDeliveryAgents = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) return errorResponse(res, 'Vendor not found', 404);

    const agents = await DeliveryAgent.find({ vendorId: vendor._id }).populate('userId', 'name email phone avatar');
    return successResponse(res, 'Delivery agents retrieved', agents);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const addDeliveryAgent = async (req, res) => {
  try {
    const { name, phone, email, password, vehicleType, vehicleNumber } = req.body;
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) return errorResponse(res, 'Vendor not found', 404);

    // Create user account for the delivery agent
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        phone,
        password: password || 'Delivery@123',
        role: 'DELIVERY_AGENT',
      });
    }

    const agent = await DeliveryAgent.create({
      userId: user._id,
      vendorId: vendor._id,
      name,
      phone,
      vehicleType: vehicleType || 'MOTORCYCLE',
      vehicleNumber: vehicleNumber || '',
      isAvailable: true,
    });

    return successResponse(res, 'Delivery agent created and linked to your store', agent, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
