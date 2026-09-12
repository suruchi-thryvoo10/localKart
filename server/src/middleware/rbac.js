import { errorResponse } from '../utils/response.js';
import { Vendor } from '../models/Vendor.js';
import { DeliveryAgent } from '../models/DeliveryAgent.js';

/**
 * Require one of the specified roles
 * @param  {...string} roles
 */
export const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401, null, 'ERR_UNAUTHORIZED');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Requires one of roles: ${roles.join(', ')}`,
        403,
        null,
        'ERR_FORBIDDEN'
      );
    }

    next();
  };
};

/**
 * Middleware ensuring the authenticated user is the owner of the requested vendor ID
 */
export const requireVendorOwnership = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') {
      return next(); // Admins can manage any vendor
    }

    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return errorResponse(res, 'No vendor profile associated with this account', 404, null, 'ERR_VENDOR_NOT_FOUND');
    }

    const targetVendorId = req.params.vendorId || req.body.vendorId || req.query.vendorId;
    if (targetVendorId && vendor._id.toString() !== targetVendorId.toString()) {
      return errorResponse(res, 'You are not authorized to modify another vendor', 403, null, 'ERR_VENDOR_UNAUTHORIZED');
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Middleware attaching the delivery agent profile
 */
export const requireDeliveryAgent = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const agent = await DeliveryAgent.findOne({ userId: req.user._id });
    if (!agent) {
      return errorResponse(res, 'No delivery agent profile found for this account', 404, null, 'ERR_AGENT_NOT_FOUND');
    }

    req.deliveryAgent = agent;
    next();
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
