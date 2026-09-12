import { DeliveryAgent, Order, Vendor } from '../../models/index.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const getAgentDashboard = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findOne({ userId: req.user._id }).populate('vendorId', 'shopName phone address location');
    if (!agent) return errorResponse(res, 'Delivery agent profile not found', 404);

    const activeOrders = await Order.find({
      $or: [
        { deliveryAgentId: agent._id, status: { $in: ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'] } },
        { vendorId: agent.vendorId?._id, status: 'READY_FOR_PICKUP', deliveryAgentId: null },
      ],
    })
      .populate('vendorId', 'shopName phone address location')
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const completedToday = await Order.find({
      deliveryAgentId: agent._id,
      status: 'DELIVERED',
      deliveredAt: { $gte: todayStart },
    });

    return successResponse(res, 'Delivery dashboard retrieved', {
      agent,
      activeOrders,
      todayStats: {
        completedDeliveriesCount: completedToday.length,
        todayEarnings: completedToday.length * 30, // ₹30 per delivery payout
        totalLifetimeEarnings: agent.totalEarnings || completedToday.length * 30,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const pickupOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const agent = await DeliveryAgent.findOne({ userId: req.user._id });
    if (!agent) return errorResponse(res, 'Delivery agent not found', 404);

    const order = await Order.findById(orderId);
    if (!order) return errorResponse(res, 'Order not found', 404);

    order.status = 'OUT_FOR_DELIVERY';
    order.deliveryAgentId = agent._id;
    order.statusHistory.push({
      status: 'OUT_FOR_DELIVERY',
      timestamp: new Date(),
      note: `Picked up by ${agent.name} (${agent.vehicleType})`,
      updatedBy: req.user._id,
    });

    agent.isAvailable = false;
    agent.activeOrderId = order._id;

    await Promise.all([order.save(), agent.save()]);

    return successResponse(res, 'Order marked as Out for Delivery! 🛵', order);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const completeDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;

    const agent = await DeliveryAgent.findOne({ userId: req.user._id });
    if (!agent) return errorResponse(res, 'Delivery agent not found', 404);

    const order = await Order.findById(orderId);
    if (!order) return errorResponse(res, 'Order not found', 404);

    if (order.status !== 'OUT_FOR_DELIVERY') {
      return errorResponse(res, 'Order must be Out for Delivery before completing delivery', 400);
    }

    if (!otp || otp.toString().trim() !== order.deliveryOtp.toString().trim()) {
      return errorResponse(res, 'Incorrect Delivery OTP. Ask the customer for the 4-digit code shown on their app.', 400, null, 'ERR_INVALID_OTP');
    }

    order.status = 'DELIVERED';
    order.deliveredAt = new Date();
    order.payment.status = 'PAID';
    order.payment.paidAt = new Date();

    order.statusHistory.push({
      status: 'DELIVERED',
      timestamp: new Date(),
      note: `Delivered successfully by ${agent.name}. Verified via OTP.`,
      updatedBy: req.user._id,
    });

    agent.isAvailable = true;
    agent.activeOrderId = null;
    agent.completedDeliveries = (agent.completedDeliveries || 0) + 1;
    agent.totalEarnings = (agent.totalEarnings || 0) + 30;

    await Promise.all([order.save(), agent.save()]);

    return successResponse(res, '🎉 Order successfully delivered and verified with OTP!', order);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getDeliveryHistory = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findOne({ userId: req.user._id });
    if (!agent) return errorResponse(res, 'Delivery agent not found', 404);

    const orders = await Order.find({ deliveryAgentId: agent._id, status: 'DELIVERED' })
      .populate('vendorId', 'shopName phone address')
      .populate('customerId', 'name phone')
      .sort({ deliveredAt: -1 });

    return successResponse(res, 'Delivery history retrieved', orders);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
