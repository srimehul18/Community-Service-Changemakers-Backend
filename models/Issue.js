import mongoose from 'mongoose'

const statusHistorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
            required: true
        },

        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        note: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
)

const feedbackSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },

        comment: {
            type: String,
            trim: true
        },

        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
)

const issueSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },

        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium'
        },

        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
            default: 'Open'
        },

        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        location: {
            tower: {
                type: String,
                trim: true
            },

            floor: {
                type: String,
                trim: true
            },

            flat: {
                type: String,
                trim: true
            },

            commonArea: {
                type: String,
                trim: true
            }
        },

        attachments: [
            {
                url: { type: String, trim: true },
                fileName: { type: String, trim: true },
                publicId: { type: String, trim: true }
            }
        ],

        statusHistory: [statusHistorySchema],

        feedback: feedbackSchema
    },
    {
        timestamps: true
    }
)

const Issue = mongoose.model('Issue', issueSchema)

export default Issue