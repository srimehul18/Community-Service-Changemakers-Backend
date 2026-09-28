import express from 'express'
import {
  getSocietyConfig,
  updateSocietyConfig
} from '../controllers/societyConfigController.js'
import protect from '../middleware/authMiddleware.js'
import authorizeRoles from '../middleware/roleMiddleware.js'

const router = express.Router()

// Anyone authenticated can view the society configuration
router.get(
  '/',
  protect,
  authorizeRoles('resident', 'staff', 'admin'),
  getSocietyConfig
)

// Only admin can modify the society configuration
router.patch(
  '/',
  protect,
  authorizeRoles('admin'),
  updateSocietyConfig
)

export default router