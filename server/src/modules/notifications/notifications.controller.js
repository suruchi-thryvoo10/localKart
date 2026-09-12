import { Notification } from '../../models/Notification.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    return successResponse(res, 'Notifications retrieved', {
      notifications,
      unreadCount,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    return successResponse(res, 'All notifications marked as read');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const markOneRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    return successResponse(res, 'Notification marked as read', notification);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
