require('dotenv').config()

const cors = require('cors')
const express = require('express')

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
