let viewQueue = []
let flushTimeout = null
const FLUSH_INTERVAL = 1500 // 1.5 seconds
const hostLink = process.env.REACT_APP_HOSTLINK

export const trackNoteView = (noteId) => {
  viewQueue.push(noteId)

  // Schedule flush if not already scheduled
  if (!flushTimeout) {
    flushTimeout = setTimeout(flushViews, FLUSH_INTERVAL)
  }
}

const flushViews = async () => {
  if (viewQueue.length === 0) {
    flushTimeout = null
    return
  }

  const ids = [...viewQueue]
  viewQueue = []
  flushTimeout = null

  try {
    const token = localStorage.getItem('token')
    if (!token) return

    await fetch(`${hostLink}/api/notes/views/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token
      },
      body: JSON.stringify({ noteIds: ids })
    })
  } catch (error) {
    console.error('Batch view tracking failed:', error)
  }
}

// Optional: Force flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (flushTimeout) {
      clearTimeout(flushTimeout)
      flushViews()
    }
  })
}
