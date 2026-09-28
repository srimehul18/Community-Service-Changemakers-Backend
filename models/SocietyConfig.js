import mongoose from 'mongoose'

const societyConfigSchema = new mongoose.Schema(
  {
    towers: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        isActive: {
          type: Boolean,
          default: true
        }
      }
    ],

    floors: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        isActive: {
          type: Boolean,
          default: true
        }
      }
    ],

    commonAreas: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        isActive: {
          type: Boolean,
          default: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
)

const SocietyConfig = mongoose.model(
  'SocietyConfig',
  societyConfigSchema
)

export default SocietyConfig