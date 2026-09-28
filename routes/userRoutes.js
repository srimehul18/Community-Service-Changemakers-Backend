import express from 'express'

import {
  createUser,
  getUsers,
  getUserById,
  getMyProfile,
  updateMyProfile,
  updateUser,
  deleteUser
} from '../controllers/userController.js'

import protect from '../middleware/authMiddleware.js'
import authorizeRoles from '../middleware/roleMiddleware.js'

const router = express.Router()

// Admin user management
router.post('/', protect, authorizeRoles('admin'), createUser)

router.get('/', protect, authorizeRoles('admin'), getUsers)

// Logged-in user's own profile
router.get(
  '/me',
  protect,
  authorizeRoles('resident', 'staff'),
  getMyProfile
)

router.patch(
  '/me',
  protect,
  authorizeRoles('resident', 'staff'),
  updateMyProfile
)

// Admin can view a specific user's profile
router.get(
  '/:id',
  protect,
  authorizeRoles('admin'),
  getUserById
)

router.patch(
  '/:id',
  protect,
  authorizeRoles('admin'),
  updateUser
)

router.delete(
  '/:id',
  protect,
  authorizeRoles('admin'),
  deleteUser
)

export default router