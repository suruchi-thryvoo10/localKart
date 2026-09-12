import { Category } from '../../models/Category.js';
import { cache } from '../../cache/redis.js';
import { successResponse, errorResponse } from '../../utils/response.js';

const CACHE_KEY_CATEGORIES = 'categories:all';

export const getCategories = async (req, res) => {
  try {
    const cached = await cache.get(CACHE_KEY_CATEGORIES);
    if (cached) {
      return successResponse(res, 'Categories retrieved from cache', cached);
    }

    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    await cache.set(CACHE_KEY_CATEGORIES, categories, 3600); // 1 hour

    return successResponse(res, 'Categories retrieved', categories);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    await cache.del(CACHE_KEY_CATEGORIES);
    return successResponse(res, 'Category created successfully', category, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return errorResponse(res, 'Category not found', 404);
    await cache.del(CACHE_KEY_CATEGORIES);
    return successResponse(res, 'Category updated successfully', category);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
