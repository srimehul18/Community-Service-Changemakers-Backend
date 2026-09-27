import express from 'express'

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js'

import protect from '../middleware/authMiddleware.js'
import authorizeRoles from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/', protect, getCategories)

router.get(
  '/:id',
  protect,
  getCategoryById
)

router.post(
  '/',
  protect,
  authorizeRoles('admin'),
  createCategory
)

router.patch(
  '/:id',
  protect,
  authorizeRoles('admin'),
  updateCategory
)

router.delete(
  '/:id',
  protect,
  authorizeRoles('admin'),
  deleteCategory
)

export default router