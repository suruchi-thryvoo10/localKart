import { User } from '../../models/User.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, 'Profile retrieved', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, preferredLanguage, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    if (avatar) user.avatar = avatar;

    await user.save();
    return successResponse(res, 'Profile updated successfully', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const addAddress = async (req, res) => {
  try {
    const { tag, recipientName, phone, streetAddress, landmark, city, state, pincode, coordinates, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({
      tag: tag || 'Home',
      recipientName: recipientName || user.name,
      phone: phone || user.phone,
      streetAddress,
      landmark,
      city,
      state,
      pincode,
      location: {
        type: 'Point',
        coordinates: coordinates || [85.8245, 20.2961],
      },
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();
    return successResponse(res, 'Address added successfully', user.addresses, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(addressId);

    if (!address) {
      return errorResponse(res, 'Address not found', 404);
    }

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    Object.assign(address, req.body);
    await user.save();

    return successResponse(res, 'Address updated successfully', user.addresses);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    user.addresses.pull({ _id: addressId });
    await user.save();

    return successResponse(res, 'Address deleted successfully', user.addresses);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });
    await user.save();

    return successResponse(res, 'Default address set', user.addresses);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
