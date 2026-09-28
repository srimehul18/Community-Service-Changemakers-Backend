import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ['resident', 'staff', 'admin'],
      default: 'resident'
    },

    age: {
      type: Number,
      min: 1,
      max: 120
    },

    phone: {
      type: String,
      trim: true
    },

    tower: {
      type: String,
      trim: true
    },

    flat: {
      type: String,
      trim: true
    },

    householdMembers: {
      type: Number,
      min: 1
    }
  },
  {
    timestamps: true
  }
)

const User = mongoose.model('User', userSchema)

export default User