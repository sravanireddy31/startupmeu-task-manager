import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5001/api/tasks'
const initialForm = { title: '', description: '', status: 'pending' }

const statusLabels = {
  pending: 'Pending',
  'in-progress': 'In progress',
  completed: 'Completed',
}

const getErrorMessage = async (response) => {
  const body = await response.json().catch(() => null)
  return body?.errors?.join(' ') || body?.message || 'Something went wrong.'
}

const formatDate = (value) =>
  new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))

function App() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!notice) return

    const timer = setTimeout(() => {
      setNotice('')
    }, 3000)

    return () => clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error(await getErrorMessage(response))

        const result = await response.json()
        setTasks(result.data || [])
      } catch (requestError) {
        setError(requestError.message || 'Unable to load tasks. Check that the backend is running.')
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!form.title.trim()) {
      setError('Please enter a task title.')
      return
    }

    const isEditing = Boolean(editingId)
    setIsSubmitting(true)

    try {
      const response = await fetch(isEditing ? `${API_URL}/${editingId}` : API_URL, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) throw new Error(await getErrorMessage(response))

      const result = await response.json()
      setTasks((current) =>
        isEditing
          ? current.map((task) => (task._id === editingId ? result.data : task))
          : [result.data, ...current],
      )
      setNotice(isEditing ? 'Task updated successfully.' : 'Task created successfully.')
      resetForm()
    } catch (requestError) {
      setError(requestError.message || 'Unable to save the task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEditing = (task) => {
    setForm({ title: task.title, description: task.description || '', status: task.status })
    setEditingId(task._id)
    setError('')
    setNotice('Editing task. Save your changes when you are ready.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return

    setDeletingId(task._id)
    setError('')
    setNotice('')

    try {
      const response = await fetch(`${API_URL}/${task._id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await getErrorMessage(response))

      setTasks((current) => current.filter((item) => item._id !== task._id))
      setNotice('Task deleted successfully.')
      if (editingId === task._id) resetForm()
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete the task.')
    } finally {
      setDeletingId(null)
    }
  }

  const completedCount = tasks.filter((task) => task.status === 'completed').length

  return (
    <main className="app-shell">
      <section className="dashboard" aria-labelledby="page-title">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">StartupMeu workspace</p>
            <h1 id="page-title">Task Manager</h1>
            <p className="subtitle">Keep your work organised, visible, and moving forward.</p>
          </div>
          <div className="progress-card" aria-label={`${completedCount} of ${tasks.length} tasks completed`}>
            <span>Progress</span><strong>{completedCount} / {tasks.length}</strong><small>tasks completed</small>
          </div>
        </header>

        <section className="workspace-grid">
          <aside className="task-form-panel" aria-labelledby="form-title">
            <div className="panel-heading"><p className="eyebrow">{editingId ? 'Update task' : 'New task'}</p><h2 id="form-title">{editingId ? 'Edit your task' : 'Add a task'}</h2></div>
            <form onSubmit={handleSubmit}>
              <label htmlFor="title">Title</label>
              <input id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Prepare sprint demo" maxLength="160" required />
              <label htmlFor="description">Description <span>Optional</span></label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Add useful context or next steps" rows="5" />
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                <option value="pending">Pending</option><option value="in-progress">In progress</option><option value="completed">Completed</option>
              </select>
              <div className="form-actions">
                <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : editingId ? 'Save changes' : 'Create task'}</button>
                {editingId && <button className="secondary-button" type="button" onClick={resetForm}>Cancel</button>}
              </div>
            </form>
          </aside>

          <section className="task-list-panel" aria-labelledby="tasks-title">
            <div className="list-heading"><p className="eyebrow">Your work</p><h2 id="tasks-title">All tasks <span>{tasks.length}</span></h2></div>
            {error && <p className="feedback error" role="alert">{error}</p>}
            {notice && <p className="feedback success" role="status">{notice}</p>}
            {isLoading ? (
              <div className="state-card" role="status"><span className="loader" aria-hidden="true" /><p>Loading your tasks…</p></div>
            ) : tasks.length === 0 ? (
              <div className="state-card empty-state"><div className="empty-icon" aria-hidden="true">✓</div><h3>No tasks yet</h3><p>Create your first task to start organising your work.</p></div>
            ) : (
              <div className="task-list">
                {tasks.map((task) => (
                  <article className="task-card" key={task._id}>
                    <div className="task-content">
                      <div className="task-meta"><span className={`status-pill status-${task.status}`}>{statusLabels[task.status] || task.status}</span><span>Created {formatDate(task.createdAt)}</span></div>
                      <h3>{task.title}</h3>{task.description && <p>{task.description}</p>}
                    </div>
                    <div className="card-actions">
                      <button className="text-button" type="button" onClick={() => startEditing(task)}>Edit</button>
                      <button className="text-button delete-button" type="button" onClick={() => deleteTask(task)} disabled={deletingId === task._id}>{deletingId === task._id ? 'Deleting…' : 'Delete'}</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  )
}

export default App
