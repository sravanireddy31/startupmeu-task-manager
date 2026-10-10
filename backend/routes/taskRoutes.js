const express = require('express')
const mongoose = require('mongoose')
const Task = require('../models/Task')

const router = express.Router()

const isValidTaskId = (id) => mongoose.Types.ObjectId.isValid(id)

const sendDatabaseError = (error, res) => {
  console.error('Task API error:', error)

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map((item) => item.message),
    })
  }

  return res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred',
  })
}

const sendInvalidId = (res) =>
  res.status(400).json({
    success: false,
    message: 'Invalid task ID',
  })

router.post('/', async (req, res) => {
  try {
    const task = await Task.create(req.body)

    return res.status(201).json({
      success: true,
      data: task,
    })
  } catch (error) {
    return sendDatabaseError(error, res)
  }
})

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      data: tasks,
    })
  } catch (error) {
    return sendDatabaseError(error, res)
  }
})

router.get('/:id', async (req, res) => {
  if (!isValidTaskId(req.params.id)) {
    return sendInvalidId(res)
  }

  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      })
    }

    return res.status(200).json({
      success: true,
      data: task,
    })
  } catch (error) {
    return sendDatabaseError(error, res)
  }
})

router.put('/:id', async (req, res) => {
  if (!isValidTaskId(req.params.id)) {
    return sendInvalidId(res)
  }

  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      })
    }

    return res.status(200).json({
      success: true,
      data: task,
    })
  } catch (error) {
    return sendDatabaseError(error, res)
  }
})

router.delete('/:id', async (req, res) => {
  if (!isValidTaskId(req.params.id)) {
    return sendInvalidId(res)
  }

  try {
    const task = await Task.findByIdAndDelete(req.params.id)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted',
    })
  } catch (error) {
    return sendDatabaseError(error, res)
  }
})

module.exports = router
