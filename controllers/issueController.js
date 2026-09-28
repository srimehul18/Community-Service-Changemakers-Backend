import Issue from '../models/Issue.js'
import cloudinary from '../config/cloudinary.js'
import fs from 'fs'

export const createIssue = async (req, res) => {
  const uploadedPublicIds = []

  try {
    if (req.user.role !== 'resident') {
      return res.status(403).json({
        message: 'Only residents can report issues'
      })
    }

    const {
      title,
      description,
      category,
      priority
    } = req.body

    let location = {}

    try {
      location = req.body.location
        ? JSON.parse(req.body.location)
        : {}
    } catch (error) {
      return res.status(400).json({
        message: 'Invalid location data'
      })
    }

    if (!title || !description || !category) {
      return res.status(400).json({
        message: 'Title, description and category are required'
      })
    }

    // Upload images to Cloudinary
    const attachments = []

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          file.path,
          {
            folder: 'mvl-coral/issues'
          }
        )

        uploadedPublicIds.push(result.public_id)

        attachments.push({
          url: result.secure_url,
          publicId: result.public_id,
          fileName: file.originalname
        })

        // Delete temporary local file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      }
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      priority,
      reportedBy: req.user._id,
      location,
      attachments,
      status: 'Open',
      statusHistory: [
        {
          status: 'Open',
          changedBy: req.user._id,
          note: 'Issue reported'
        }
      ]
    })

    const populatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('category', 'name')

    res.status(201).json({
      message: 'Issue created successfully',
      issue: populatedIssue
    })

  } catch (error) {
    console.error('Create issue error:', error)

    // Remove temporary files if they still exist
    if (req.files) {
      for (const file of req.files) {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      }
    }

    for (const publicId of uploadedPublicIds) {
      try {
        await cloudinary.uploader.destroy(publicId)
      } catch (deleteError) {
        console.error(
          `Failed to clean up Cloudinary asset ${publicId}:`,
          deleteError.message
        )
      }
    }

    res.status(500).json({
      message: 'Failed to create issue',
      error: error.message
    })
  }
}


export const getIssues = async (req, res) => {
  try {
    let filter = {}

    if (req.user.role === 'resident') {
      filter.reportedBy = req.user._id
    }

    if (req.user.role === 'staff') {
      filter.assignedTo = req.user._id
    }

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('category', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json(issues)
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch issues',
      error: error.message
    })
  }
}


export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('category', 'name')
      .populate('statusHistory.changedBy', 'name email role')
      .populate('feedback.submittedBy', 'name email role')

    if (!issue) {
      return res.status(404).json({
        message: 'Issue not found'
      })
    }

    const userId = req.user._id.toString()

    const isAdmin = req.user.role === 'admin'

    const isResidentOwner =
      req.user.role === 'resident' &&
      issue.reportedBy._id.toString() === userId

    const isAssignedStaff =
      req.user.role === 'staff' &&
      issue.assignedTo &&
      issue.assignedTo._id.toString() === userId

    if (!isAdmin && !isResidentOwner && !isAssignedStaff) {
      return res.status(403).json({
        message: 'You do not have access to this issue'
      })
    }

    res.status(200).json(issue)
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch issue',
      error: error.message
    })
  }
}


export const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)

    if (!issue) {
      return res.status(404).json({
        message: 'Issue not found'
      })
    }

    const userId = req.user._id.toString()

    const isAdmin = req.user.role === 'admin'

    const isAssignedStaff =
      req.user.role === 'staff' &&
      issue.assignedTo &&
      issue.assignedTo.toString() === userId

    if (!isAdmin && !isAssignedStaff) {
      return res.status(403).json({
        message: 'You do not have permission to update this issue'
      })
    }

    const {
      title,
      description,
      category,
      priority,
      status,
      assignedTo,
      location,
      attachments,
      note
    } = req.body

    // Common fields that admin/staff can update
    if (title !== undefined) {
      issue.title = title
    }

    if (description !== undefined) {
      issue.description = description
    }

    if (category !== undefined) {
      issue.category = category
    }

    if (priority !== undefined) {
      issue.priority = priority
    }

    if (location !== undefined) {
      issue.location = location
    }

    if (attachments !== undefined) {
      issue.attachments = attachments
    }

    // Only admin can assign staff
    if (assignedTo !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({
          message: 'Only admins can assign staff'
        })
      }

      issue.assignedTo = assignedTo
    }

    // Status changes can be made by admin or assigned staff
    if (status !== undefined && status !== issue.status) {
      issue.status = status

      issue.statusHistory.push({
        status,
        changedBy: req.user._id,
        note: note || ''
      })
    }

    await issue.save()

    const updatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('category', 'name')
      .populate('statusHistory.changedBy', 'name email role')

    res.status(200).json({
      message: 'Issue updated successfully',
      issue: updatedIssue
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update issue',
      error: error.message
    })
  }
}


export const deleteIssue = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Only admins can delete issues'
      })
    }

    const issue = await Issue.findById(req.params.id)

    if (!issue) {
      return res.status(404).json({
        message: 'Issue not found'
      })
    }

    // Delete attachments from Cloudinary
    for (const attachment of issue.attachments || []) {
      if (attachment.publicId) {
        try {
          await cloudinary.uploader.destroy(
            attachment.publicId,
            {
              resource_type: 'image',
              invalidate: true
            }
          )
        } catch (cloudinaryError) {
          console.error(
            `Failed to delete Cloudinary asset ${attachment.publicId}:`,
            cloudinaryError.message
          )
        }
      }
    }

    // Delete issue from MongoDB
    await Issue.findByIdAndDelete(req.params.id)

    res.status(200).json({
      message: 'Issue and attachments deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete issue',
      error: error.message
    })
  }
}
export const submitFeedback = async (req, res) => {
  try {
    if (req.user.role !== 'resident') {
      return res.status(403).json({
        message: 'Only residents can submit feedback'
      })
    }

    const { rating, comment } = req.body

    if (!rating) {
      return res.status(400).json({
        message: 'Rating is required'
      })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5'
      })
    }

    const issue = await Issue.findById(req.params.id)

    if (!issue) {
      return res.status(404).json({
        message: 'Issue not found'
      })
    }

    if (issue.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You can only submit feedback for your own issues'
      })
    }

    if (!['Resolved', 'Closed'].includes(issue.status)) {
      return res.status(400).json({
        message: 'Feedback can only be submitted for resolved or closed issues'
      })
    }

    if (issue.feedback) {
      return res.status(400).json({
        message: 'Feedback has already been submitted'
      })
    }

    issue.feedback = {
      rating,
      comment,
      submittedBy: req.user._id
    }

    await issue.save()

    const updatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('category', 'name')
      .populate('feedback.submittedBy', 'name email role')

    res.status(201).json({
      message: 'Feedback submitted successfully',
      issue: updatedIssue
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to submit feedback',
      error: error.message
    })
  }
}


export const reopenIssue = async (req, res) => {
  try {
    if (req.user.role !== 'resident') {
      return res.status(403).json({
        message: 'Only residents can reopen issues'
      })
    }

    const issue = await Issue.findById(req.params.id)

    if (!issue) {
      return res.status(404).json({
        message: 'Issue not found'
      })
    }

    if (issue.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You can only reopen your own issues'
      })
    }

    if (!['Resolved', 'Closed'].includes(issue.status)) {
      return res.status(400).json({
        message: 'Only resolved or closed issues can be reopened'
      })
    }

    issue.status = 'Open'

    issue.statusHistory.push({
      status: 'Open',
      changedBy: req.user._id,
      note: 'Issue reopened by resident'
    })

    await issue.save()

    const updatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('category', 'name')
      .populate('statusHistory.changedBy', 'name email role')

    res.status(200).json({
      message: 'Issue reopened successfully',
      issue: updatedIssue
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to reopen issue',
      error: error.message
    })
  }
}
export const getIssueAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Only admins can view analytics'
      })
    }

    const [
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      issuesByPriority,
      issuesByCategory,
      recurringIssues
    ] = await Promise.all([
      Issue.countDocuments(),

      Issue.countDocuments({ status: 'Open' }),

      Issue.countDocuments({ status: 'In Progress' }),

      Issue.countDocuments({ status: 'Resolved' }),

      Issue.countDocuments({ status: 'Closed' }),

      // Issues by priority
      Issue.aggregate([
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]),

      // Issues by category
      Issue.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 0,
            category: {
              $ifNull: ['$category.name', 'Unknown']
            },
            count: 1
          }
        },
        {
          $sort: { count: -1 }
        }
      ]),

      // Recurring issues:
      // same category + same location reported 3 or more times
      Issue.aggregate([
        {
          $group: {
            _id: {
              category: '$category',
              tower: { $ifNull: ['$location.tower', ''] },
              floor: { $ifNull: ['$location.floor', ''] },
              flat: { $ifNull: ['$location.flat', ''] },
              commonArea: { $ifNull: ['$location.commonArea', ''] }
            },
            count: { $sum: 1 }
          }
        },

        // Only groups with 3 or more reports are recurring
        {
          $match: {
            count: { $gte: 3 }
          }
        },

        // Get category name
        {
          $lookup: {
            from: 'categories',
            localField: '_id.category',
            foreignField: '_id',
            as: 'category'
          }
        },

        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        },

        // Create a readable location string
        {
          $project: {
            _id: 0,

            category: {
              $ifNull: ['$category.name', 'Unknown']
            },

            tower: '$_id.tower',
            floor: '$_id.floor',
            flat: '$_id.flat',
            commonArea: '$_id.commonArea',

            count: 1
          }
        },

        {
          $sort: {
            count: -1
          }
        }
      ])
    ])

    res.status(200).json({
      summary: {
        total: totalIssues,
        open: openIssues,
        inProgress: inProgressIssues,
        resolved: resolvedIssues,
        closed: closedIssues,

        // Number of recurring category/location combinations
        recurring: recurringIssues.length
      },

      issuesByPriority,
      issuesByCategory,
      recurringIssues
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch analytics',
      error: error.message
    })
  }
}