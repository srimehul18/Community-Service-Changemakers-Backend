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
      trim: true,
      validate: {
        validator: function (value) {
          return (
            !this.isModified('phone') ||
            !value ||
            /^[6-9]\d{9}$/.test(value)
          )
        },
        message:
          'Phone number must be exactly 10 digits and start with 6, 7, 8, or 9.'
      }
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