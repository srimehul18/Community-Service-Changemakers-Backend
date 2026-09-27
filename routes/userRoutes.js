import express from 'express'

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js'

import protect from '../middleware/authMiddleware.js'
import authorizeRoles from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/', protect, authorizeRoles('admin'), createUser)

router.get('/', protect, authorizeRoles('admin'), getUsers)

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