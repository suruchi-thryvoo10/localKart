import { Payment, Order } from '../../models/index.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const processSimulatedPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod = 'ONLINE', paymentGateway = 'SIMULATED_RAZORPAY' } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return errorResponse(res, 'Order not found', 404);

    const transactionId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await Payment.create({
      orderId: order._id,
      customerId: req.user._id,
      vendorId: order.vendorId,
      transactionId,
      amount: order.pricing.finalAmount,
      paymentMethod,
      paymentGateway,
      status: 'PAID',
      gatewayResponse: {
        simulated: true,
        razorpay_payment_id: `pay_${Date.now()}`,
        status: 'captured',
      },
    });

    order.payment.status = 'PAID';
    order.payment.transactionId = transactionId;
    order.payment.paidAt = new Date();
    await order.save();

    return successResponse(res, 'Payment processed successfully', {
      payment,
      order,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ customerId: req.user._id })
      .populate('orderId', 'orderNumber status pricing')
      .populate('vendorId', 'shopName')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Payment history retrieved', payments);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
