import { Product, Vendor, Category } from '../../models/index.js';
import { cache } from '../../cache/redis.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const getProducts = async (req, res) => {
  try {
    const {
      vendorId,
      categoryId,
      freshnessStatus,
      badge,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const query = { isAvailable: true };

    if (vendorId) query.vendorId = vendorId;
    if (categoryId) query.categoryId = categoryId;
    if (freshnessStatus) query.freshnessStatus = freshnessStatus;
    if (badge) query.badge = badge;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.hi': { $regex: search, $options: 'i' } },
        { 'name.od': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('vendorId', 'shopName ownerName phone address rating hasFreshStockToday isOpen deliveryFee freeDeliveryAbove')
        .populate('categoryId', 'name slug icon')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return successResponse(res, 'Products retrieved', {
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getFreshTodayProducts = async (req, res) => {
  try {
    const { vendorId, limit = 20 } = req.query;
    const query = {
      isAvailable: true,
      freshnessStatus: 'FRESH_TODAY',
    };

    if (vendorId) {
      query.vendorId = vendorId;
    }

    const products = await Product.find(query)
      .populate('vendorId', 'shopName rating address isOpen')
      .populate('categoryId', 'name slug icon')
      .sort({ updatedAt: -1 })
      .limit(Number(limit));

    return successResponse(res, '🥬 Fresh harvest items today', products);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendorId', 'shopName ownerName phone address deliveryRadiusKm deliveryFee freeDeliveryAbove rating hasFreshStockToday isOpen')
      .populate('categoryId', 'name slug icon');

    if (!product) return errorResponse(res, 'Product not found', 404);

    return successResponse(res, 'Product details', product);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const createProduct = async (req, res) => {
  try {
    let vendorId = req.body.vendorId;

    if (req.user.role === 'VENDOR') {
      const vendor = await Vendor.findOne({ userId: req.user._id });
      if (!vendor) return errorResponse(res, 'Vendor profile not found', 404);
      vendorId = vendor._id;
    }

    if (!vendorId) {
      return errorResponse(res, 'vendorId is required', 400);
    }

    const product = await Product.create({
      ...req.body,
      vendorId,
    });

    await cache.delPattern('vendors:nearby:*');

    return successResponse(res, 'Product created successfully', product, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found', 404);

    if (req.user.role === 'VENDOR') {
      const vendor = await Vendor.findOne({ userId: req.user._id });
      if (!vendor || product.vendorId.toString() !== vendor._id.toString()) {
        return errorResponse(res, 'Unauthorized to edit this product', 403);
      }
    }

    Object.assign(product, req.body);
    await product.save();

    return successResponse(res, 'Product updated successfully', product);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const toggleProductFreshness = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found', 404);

    product.freshnessStatus = product.freshnessStatus === 'FRESH_TODAY' ? 'AVAILABLE' : 'FRESH_TODAY';
    product.harvestedDate = product.freshnessStatus === 'FRESH_TODAY' ? 'Today Morning Fresh Harvest' : product.harvestedDate;
    await product.save();

    return successResponse(res, `Freshness status updated to ${product.freshnessStatus}`, product);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateStock = async (req, res) => {
  try {
    const { stockQuantity, isAvailable } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found', 404);

    if (stockQuantity !== undefined) {
      product.stockQuantity = Number(stockQuantity);
      if (product.stockQuantity === 0) {
        product.freshnessStatus = 'OUT_OF_STOCK';
      } else if (product.stockQuantity < 10) {
        product.freshnessStatus = 'LOW_STOCK';
      }
    }

    if (isAvailable !== undefined) {
      product.isAvailable = isAvailable;
    }

    await product.save();
    return successResponse(res, 'Stock updated successfully', product);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found', 404);

    if (req.user.role === 'VENDOR') {
      const vendor = await Vendor.findOne({ userId: req.user._id });
      if (!vendor || product.vendorId.toString() !== vendor._id.toString()) {
        return errorResponse(res, 'Unauthorized to delete this product', 403);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    return successResponse(res, 'Product removed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
