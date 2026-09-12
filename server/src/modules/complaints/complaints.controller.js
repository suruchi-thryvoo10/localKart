import { Complaint, Order } from '../../models/index.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const createComplaint = async (req, res) => {
  try {
    const { orderId, subject, category, description } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return errorResponse(res, 'Order not found', 404);

    const complaint = await Complaint.create({
      orderId,
      userId: req.user._id,
      vendorId: order.vendorId,
      subject,
      category,
      description,
    });

    return successResponse(res, 'Complaint registered. Our team will review within 24 hours.', complaint, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id })
      .populate('orderId', 'orderNumber status pricing')
      .populate('vendorId', 'shopName')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Complaints retrieved', complaints);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getAllComplaintsAdmin = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('orderId', 'orderNumber status pricing')
      .populate('userId', 'name email phone')
      .populate('vendorId', 'shopName phone')
      .sort({ createdAt: -1 });

    return successResponse(res, 'All complaints retrieved', complaints);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const resolveComplaint = async (req, res) => {
  try {
    const { status, resolutionNote, refundAmount } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return errorResponse(res, 'Complaint not found', 404);

    if (status) complaint.status = status;
    if (resolutionNote) complaint.resolutionNote = resolutionNote;
    if (refundAmount !== undefined) complaint.refundAmount = Number(refundAmount);

    await complaint.save();
    return successResponse(res, 'Complaint updated successfully', complaint);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
