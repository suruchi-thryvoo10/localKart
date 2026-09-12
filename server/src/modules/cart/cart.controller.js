import { Cart, Product, Vendor, Coupon } from '../../models/index.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate('vendorId', 'shopName minOrderAmount deliveryFee freeDeliveryAbove isOpen');
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
    let deliveryFee = 0;
    let freeDeliveryAbove = 300;
    let minOrderAmount = 0;

    if (cart.vendorId) {
      deliveryFee = cart.vendorId.deliveryFee || 25;
      freeDeliveryAbove = cart.vendorId.freeDeliveryAbove || 300;
      minOrderAmount = cart.vendorId.minOrderAmount || 0;
      if (subtotal >= freeDeliveryAbove && subtotal > 0) {
        deliveryFee = 0;
      }
    }

    let discountAmount = cart.discountAmount || 0;
    const finalAmount = Math.max(0, subtotal + (subtotal > 0 ? deliveryFee : 0) - discountAmount);

    return successResponse(res, 'Cart retrieved', {
      cart,
      summary: {
        itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: Math.round(subtotal * 100) / 100,
        deliveryFee,
        discountAmount,
        finalAmount: Math.round(finalAmount * 100) / 100,
        minOrderMet: subtotal >= minOrderAmount,
        minOrderAmount,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, forceClear = false } = req.body;

    const product = await Product.findById(productId).populate('vendorId');
    if (!product || !product.isAvailable) {
      return errorResponse(res, 'Product is no longer available', 404);
    }

    if (product.stockQuantity < quantity) {
      return errorResponse(res, `Only ${product.stockQuantity} items in stock`, 400);
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [], vendorId: product.vendorId._id });
    }

    // Check single-vendor rule
    if (cart.vendorId && cart.items.length > 0 && cart.vendorId.toString() !== product.vendorId._id.toString()) {
      if (!forceClear) {
        const existingVendor = await Vendor.findById(cart.vendorId);
        return res.status(409).json({
          success: false,
          conflict: true,
          message: `Your cart contains items from "${existingVendor?.shopName || 'another store'}". Discard items and add from "${product.vendorId.shopName}"?`,
          code: 'ERR_VENDOR_MISMATCH',
          currentVendor: existingVendor,
          newVendor: product.vendorId,
        });
      } else {
        // Force clear cart to switch vendor
        cart.items = [];
        cart.vendorId = product.vendorId._id;
        cart.couponCode = null;
        cart.discountAmount = 0;
      }
    }

    cart.vendorId = product.vendorId._id;

    const finalPrice = product.discountPercent > 0
      ? Math.round((product.price - (product.price * product.discountPercent) / 100) * 100) / 100
      : product.price;

    const existingItemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (existingItemIndex > -1) {
      const newQty = cart.items[existingItemIndex].quantity + quantity;
      if (newQty > product.stockQuantity) {
        return errorResponse(res, `Cannot add more. Only ${product.stockQuantity} items in stock`, 400);
      }
      cart.items[existingItemIndex].quantity = newQty;
      cart.items[existingItemIndex].finalPrice = finalPrice;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name.en || product.name,
        price: product.price,
        discountPercent: product.discountPercent,
        finalPrice,
        unit: product.unit,
        image: product.images[0] || '',
        quantity,
      });
    }

    await cart.save();
    return getCart(req, res);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return errorResponse(res, 'Cart not found', 404);

    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
      if (cart.items.length === 0) {
        cart.vendorId = null;
        cart.couponCode = null;
        cart.discountAmount = 0;
      }
    } else {
      const item = cart.items.find((i) => i.productId.toString() === productId);
      if (item) {
        const product = await Product.findById(productId);
        if (product && product.stockQuantity < quantity) {
          return errorResponse(res, `Only ${product.stockQuantity} in stock`, 400);
        }
        item.quantity = quantity;
      }
    }

    await cart.save();
    return getCart(req, res);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      cart.vendorId = null;
      cart.couponCode = null;
      cart.discountAmount = 0;
      await cart.save();
    }
    return successResponse(res, 'Cart cleared successfully', { items: [] });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 'Cart is empty', 400);
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return errorResponse(res, 'Invalid or expired coupon code', 404);
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
    if (subtotal < coupon.minOrderAmount) {
      return errorResponse(res, `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`, 400);
    }

    const discount = coupon.calculateDiscount(subtotal);
    cart.couponCode = coupon.code;
    cart.discountAmount = discount;
    await cart.save();

    return successResponse(res, `Coupon "${coupon.code}" applied! You saved ₹${discount}`, {
      couponCode: coupon.code,
      discountAmount: discount,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
