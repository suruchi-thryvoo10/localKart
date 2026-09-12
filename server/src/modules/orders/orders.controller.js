import { Order, Cart, Product, Vendor, DeliveryAgent, User, Notification, Payment } from '../../models/index.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { config } from '../../config/index.js';

// Helper to generate 4-digit OTP
const generateDeliveryOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

export const createOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod = 'COD', customerNotes = '' } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 'Your cart is empty', 400);
    }

    const vendor = await Vendor.findById(cart.vendorId);
    if (!vendor || !vendor.isOpen) {
      return errorResponse(res, 'This store is currently closed or unavailable', 400);
    }

    // Atomic Stock Check & Decrement
    const orderItems = [];
    let itemsTotal = 0;

    for (const item of cart.items) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          isAvailable: true,
          stockQuantity: { $gte: item.quantity },
        },
        {
          $inc: { stockQuantity: -item.quantity },
        },
        { new: true }
      );

      if (!product) {
        // Rollback already deducted items if any
        for (const deducted of orderItems) {
          await Product.findByIdAndUpdate(deducted.productId, {
            $inc: { stockQuantity: deducted.quantity },
          });
        }
        return errorResponse(
          res,
          `Sorry, "${item.name}" ran out of stock or does not have enough quantity available.`,
          400,
          null,
          'ERR_INSUFFICIENT_STOCK'
        );
      }

      const finalPrice = product.discountPercent > 0
        ? Math.round((product.price - (product.price * product.discountPercent) / 100) * 100) / 100
        : product.price;

      const itemTotal = finalPrice * item.quantity;
      itemsTotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name.en || product.name,
        price: product.price,
        discountPercent: product.discountPercent,
        finalPrice,
        unit: product.unit,
        quantity: item.quantity,
        total: Math.round(itemTotal * 100) / 100,
        image: product.images[0] || '',
      });
    }

    // Check min order amount
    if (itemsTotal < (vendor.minOrderAmount || 0)) {
      return errorResponse(res, `Minimum order amount for ${vendor.shopName} is ₹${vendor.minOrderAmount}`, 400);
    }

    // Pricing calculation
    let deliveryFee = vendor.deliveryFee || 25;
    if (itemsTotal >= (vendor.freeDeliveryAbove || 300)) {
      deliveryFee = 0;
    }

    const couponDiscount = cart.discountAmount || 0;
    const finalAmount = Math.max(0, itemsTotal + deliveryFee - couponDiscount);

    // Platform commission calculation
    const commissionPercent = vendor.commissionPercentage || config.platformCommissionPercentage || 5;
    const commissionAmount = Math.round(((itemsTotal * commissionPercent) / 100) * 100) / 100;
    const vendorEarnings = Math.round((itemsTotal - commissionAmount + deliveryFee) * 100) / 100;

    const orderNumber = `LK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const deliveryOtp = generateDeliveryOtp();

    const order = await Order.create({
      orderNumber,
      customerId: req.user._id,
      vendorId: vendor._id,
      items: orderItems,
      pricing: {
        itemsTotal: Math.round(itemsTotal * 100) / 100,
        deliveryFee,
        couponDiscount,
        platformCommissionPercentage: commissionPercent,
        platformCommissionAmount: commissionAmount,
        vendorEarnings,
        finalAmount: Math.round(finalAmount * 100) / 100,
      },
      couponCode: cart.couponCode,
      deliveryAddress,
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
        transactionId: paymentMethod === 'ONLINE' ? `TXN_${Date.now()}` : null,
        paidAt: paymentMethod === 'ONLINE' ? new Date() : null,
      },
      status: 'PENDING',
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date(),
          note: 'Order placed by customer',
          updatedBy: req.user._id,
        },
      ],
      deliveryOtp,
      customerNotes,
    });

    // Record Payment
    if (paymentMethod === 'ONLINE') {
      await Payment.create({
        orderId: order._id,
        customerId: req.user._id,
        vendorId: vendor._id,
        transactionId: order.payment.transactionId,
        amount: order.pricing.finalAmount,
        paymentMethod: 'ONLINE',
        paymentGateway: 'SIMULATED_RAZORPAY',
        status: 'PAID',
      });
    }

    // Clear cart
    cart.items = [];
    cart.vendorId = null;
    cart.couponCode = null;
    cart.discountAmount = 0;
    await cart.save();

    // Increment vendor orders count
    vendor.totalOrders = (vendor.totalOrders || 0) + 1;
    await vendor.save();

    // Notify Vendor
    await Notification.create({
      userId: vendor.userId,
      title: '🚨 New Order Received!',
      message: `New Order #${order.orderNumber} for ₹${order.pricing.finalAmount} received. Tap to Accept.`,
      type: 'ORDER_UPDATE',
      metadata: { orderId: order._id, vendorId: vendor._id },
    });

    return successResponse(res, 'Order placed successfully', order, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('vendorId', 'shopName phone address logo banner')
      .populate('deliveryAgentId', 'name phone vehicleType vehicleNumber')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Customer orders retrieved', orders);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getVendorOrders = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) return errorResponse(res, 'Vendor not found', 404);

    const { status, date } = req.query;
    const query = { vendorId: vendor._id };

    if (status) {
      query.status = status;
    }

    if (date === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: today };
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name phone email')
      .populate('deliveryAgentId', 'name phone vehicleType vehicleNumber isAvailable')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Vendor orders retrieved', orders);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('vendorId', 'shopName phone address ownerName location logo')
      .populate('customerId', 'name phone email')
      .populate('deliveryAgentId', 'name phone vehicleType vehicleNumber');

    if (!order) return errorResponse(res, 'Order not found', 404);

    return successResponse(res, 'Order details retrieved', order);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, deliveryAgentId, otp } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return errorResponse(res, 'Order not found', 404);

    const prevStatus = order.status;

    // Vendor actions
    if (['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'CANCELLED', 'REJECTED'].includes(status)) {
      order.status = status;

      if (deliveryAgentId) {
        order.deliveryAgentId = deliveryAgentId;
        await DeliveryAgent.findByIdAndUpdate(deliveryAgentId, {
          isAvailable: false,
          activeOrderId: order._id,
        });
      }

      // If rejected/cancelled by vendor, restore stock
      if (['CANCELLED', 'REJECTED'].includes(status) && !['CANCELLED', 'REJECTED'].includes(prevStatus)) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stockQuantity: item.quantity },
          });
        }
      }
    }

    // Delivery Agent actions
    if (status === 'OUT_FOR_DELIVERY') {
      order.status = 'OUT_FOR_DELIVERY';
      if (req.user.role === 'DELIVERY_AGENT') {
        const agent = await DeliveryAgent.findOne({ userId: req.user._id });
        if (agent) {
          order.deliveryAgentId = agent._id;
          agent.isAvailable = false;
          agent.activeOrderId = order._id;
          await agent.save();
        }
      }
    }

    if (status === 'DELIVERED') {
      // Check OTP verification
      if (!otp || otp.toString().trim() !== order.deliveryOtp.toString().trim()) {
        return errorResponse(res, 'Invalid Delivery OTP. Ask customer for the 4-digit code.', 400, null, 'ERR_INVALID_OTP');
      }

      order.status = 'DELIVERED';
      order.deliveredAt = new Date();
      order.payment.status = 'PAID';
      order.payment.paidAt = new Date();

      if (order.deliveryAgentId) {
        await DeliveryAgent.findByIdAndUpdate(order.deliveryAgentId, {
          isAvailable: true,
          activeOrderId: null,
          $inc: { completedDeliveries: 1, totalEarnings: 30 },
        });
      }
    }

    order.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      note: note || `Status updated to ${order.status}`,
      updatedBy: req.user._id,
    });

    await order.save();

    // Notify Customer
    await Notification.create({
      userId: order.customerId,
      title: `Order Update #${order.orderNumber}`,
      message: `Your order is now ${order.status.replace(/_/g, ' ')}.`,
      type: 'ORDER_UPDATE',
      metadata: { orderId: order._id },
    });

    return successResponse(res, `Order status updated to ${order.status}`, order);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const cancelOrderCustomer = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!order) return errorResponse(res, 'Order not found', 404);

    if (order.status !== 'PENDING') {
      return errorResponse(res, 'Order can only be cancelled while in PENDING status', 400);
    }

    order.status = 'CANCELLED';
    order.cancellationReason = reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: `Cancelled by customer: ${reason || 'No reason provided'}`,
      updatedBy: req.user._id,
    });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: item.quantity },
      });
    }

    await order.save();
    return successResponse(res, 'Order cancelled successfully', order);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
