const express = require('express')
const mongoose = require('mongoose')
const Task = require('../models/Task')

const router = express.Router()

const isValidTaskId = (id) => mongoose.Types.ObjectId.isValid(id)
const allowedTaskFields = ['title', 'description', 'status']
const allowedStatuses = ['pending', 'in-progress', 'completed']

const validateTaskData = (data, { isUpdate = false } = {}) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return ['Task data must be a JSON object']
  }

  const fields = Object.keys(data)
  const errors = fields
    .filter((field) => !allowedTaskFields.includes(field))
    .map((field) => `Unexpected field: ${field}`)

  if (isUpdate && fields.length === 0) {
    errors.push('Provide at least one task field to update')
  }

  if (!isUpdate && !Object.hasOwn(data, 'title')) {
    errors.push('Title is required')
  }

  if (Object.hasOwn(data, 'title')) {
    if (typeof data.title !== 'string') {
      errors.push('Title must be a string')
    } else if (!data.title.trim()) {
      errors.push('Title cannot be empty')
    } else if (data.title.trim().length > 160) {
      errors.push('Title cannot exceed 160 characters')
    }
  }

  if (Object.hasOwn(data, 'description') && typeof data.description !== 'string') {
    errors.push('Description must be a string')
  }

  if (Object.hasOwn(data, 'status')) {
    if (typeof data.status !== 'string') {
      errors.push('Status must be a string')
    } else if (!allowedStatuses.includes(data.status)) {
      errors.push('Status must be pending, in-progress, or completed')
    }
  }

  return errors
}

const sendValidationError = (res, errors) =>
  res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors,
  })

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
  const errors = validateTaskData(req.body)
  if (errors.length) {
    return sendValidationError(res, errors)
  }

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

  const errors = validateTaskData(req.body, { isUpdate: true })
  if (errors.length) {
    return sendValidationError(res, errors)
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
