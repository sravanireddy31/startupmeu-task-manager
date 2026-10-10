require('dotenv').config()

const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const taskRoutes = require('./routes/taskRoutes')

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
)

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
  })
})

app.use('/api/tasks', taskRoutes)

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
