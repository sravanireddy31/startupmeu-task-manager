require('dotenv').config()

const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const taskRoutes = require('./routes/taskRoutes')

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json({ limit: '10kb' }))
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  }),
)

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
  })
})

app.use('/api/tasks', taskRoutes)

app.use((error, req, res, next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body must not exceed 10kb',
      errors: ['Request body is too large'],
    })
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON request body',
      errors: ['Request body must be valid JSON'],
    })
  }

  return next(error)
})

const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message)
    process.exit(1)
  }
}

startServer()
