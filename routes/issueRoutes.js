import express from 'express'
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  submitFeedback,
  reopenIssue,
  getIssueAnalytics
} from '../controllers/issueController.js'
import protect from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.post(
  '/',
  protect,
  upload.array('images', 5),
  createIssue
)

router.post('/:id/feedback', protect, submitFeedback)

router.post('/:id/reopen', protect, reopenIssue)

router.get('/', protect, getIssues)

router.get('/analytics', protect, getIssueAnalytics)

router.get('/:id', protect, getIssueById)

router.patch('/:id', protect, updateIssue)

router.delete('/:id', protect, deleteIssue)

export default router