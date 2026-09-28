import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Issue from '../models/Issue.js'

export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      tower,
      flat
    } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'resident',
      tower,
      flat
    })

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tower: user.tower,
        flat: user.flat
      }
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create user',
      error: error.message
    })
  }
}

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      '-password'
    )

    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message
    })
  }
}

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      '-password'
    )

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const issuesReported = await Issue.countDocuments({
      reportedBy: user._id
    })

    res.status(200).json({
      ...user.toObject(),
      issuesReported
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch user',
      error: error.message
    })
  }
}

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      '-password'
    )

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const issuesReported = await Issue.countDocuments({
      reportedBy: user._id
    })

    res.status(200).json({
      ...user.toObject(),
      issuesReported
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch profile',
      error: error.message
    })
  }
}

export const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      age,
      phone,
      tower,
      flat,
      householdMembers
    } = req.body

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    if (name !== undefined) {
      user.name = name
    }

    if (age !== undefined) {
      user.age = age
    }

    if (phone !== undefined) {
      user.phone = phone
    }

    if (tower !== undefined) {
      user.tower = tower
    }

    if (flat !== undefined) {
      user.flat = flat
    }

    if (householdMembers !== undefined) {
      user.householdMembers = householdMembers
    }

    await user.save()

    const issuesReported = await Issue.countDocuments({
      reportedBy: user._id
    })

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        phone: user.phone,
        tower: user.tower,
        flat: user.flat,
        householdMembers: user.householdMembers,
        issuesReported
      }
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update profile',
      error: error.message
    })
  }
}

export const updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      tower,
      flat
    } = req.body

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })

      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email already exists'
        })
      }

      user.email = email
    }

    if (name !== undefined) {
      user.name = name
    }

    if (password !== undefined) {
      user.password = await bcrypt.hash(password, 10)
    }

    if (role !== undefined) {
      user.role = role
    }

    if (tower !== undefined) {
      user.tower = tower
    }

    if (flat !== undefined) {
      user.flat = flat
    }

    await user.save()

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tower: user.tower,
        flat: user.flat
      }
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update user',
      error: error.message
    })
  }
}

export const deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        message: 'You cannot delete your own account'
      })
    }

    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    res.status(200).json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete user',
      error: error.message
    })
  }
}