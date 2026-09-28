import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import userRoutes from './routes/userRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import issueRoutes from './routes/issueRoutes.js'
import authRoutes from './routes/authRoutes.js'
import protect from './middleware/authMiddleware.js'
import authorizeRoles from './middleware/roleMiddleware.js'
import uploadRoutes from './routes/uploadRoutes.js'
import societyConfigRoutes from './routes/societyConfigRoutes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/users', userRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/society-config', societyConfigRoutes)

app.get('/', (req, res) => {
  res.send('MVL Coral API is running')
})
app.get('/api/auth/test', protect, (req, res) => {
  res.status(200).json({
    message: 'Authentication successful',
    user: req.user
  })
})

app.get(
  '/api/auth/admin-test',
  protect,
  authorizeRoles('admin'),
  (req, res) => {
    res.status(200).json({
      message: 'Admin access successful',
      user: req.user
    })
  }
)

const PORT = process.env.PORT || 5000

connectDB()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})