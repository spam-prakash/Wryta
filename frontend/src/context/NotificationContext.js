import { createContext, useState, useEffect, useCallback, useRef } from 'react'

export const NotificationContext = createContext()

export default function NotificationProvider ({ children }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const token = localStorage.getItem('token')
  const hostLink = process.env.REACT_APP_HOSTLINK
  const LIMIT = 8

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return

    try {
      const res = await fetch(`${hostLink}/api/notification/unread-count`, {
        headers: { 'auth-token': token }
      })

      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }, [token, hostLink])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${hostLink}/api/notification?page=1&limit=${LIMIT}`, {
        headers: { 'auth-token': token }
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch notifications: ${res.status}`)
      }

      const data = await res.json()
      const newNotifications = data.notifications || data || []
      setNotifications(newNotifications)

      // Calculate unread count from notifications
      const unread = newNotifications.filter(n => !n.isRead).length
      setUnreadCount(unread)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [token, hostLink, LIMIT])

  // Mark single notification as read
  const markAsRead = useCallback(async (id) => {
    if (!token) return

    try {
      const response = await fetch(`${hostLink}/api/notification/read/${id}`, {
        method: 'PUT',
        headers: { 'auth-token': token }
      })

      if (!response.ok) {
        throw new Error('Failed to mark as read')
      }

      setNotifications(prev =>
        prev.map(n =>
          n._id === id ? { ...n, isRead: true } : n
        )
      )
      setUnreadCount(prev => Math.max(prev - 1, 0))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [token, hostLink])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!token || unreadCount === 0) return

    try {
      const response = await fetch(`${hostLink}/api/notification/read-all`, {
        method: 'PUT',
        headers: { 'auth-token': token }
      })

      if (!response.ok) {
        throw new Error('Failed to mark all as read')
      }

      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }, [token, hostLink, unreadCount])

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications()
    await fetchUnreadCount()
  }, [fetchNotifications, fetchUnreadCount])

  // Initial fetch on mount
  useEffect(() => {
    const initialize = async () => {
      if (token) {
        await fetchNotifications()
        await fetchUnreadCount()
      } else {
        setNotifications([])
        setUnreadCount(0)
      }
    }

    initialize()
  }, [token])

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!token) return

    const pollInterval = setInterval(() => {
      if (!document.hidden) {
        fetchUnreadCount()
      }
    }, 30000)

    const visibilityChangeHandler = () => {
      if (!document.hidden) {
        fetchUnreadCount()
      }
    }

    document.addEventListener('visibilitychange', visibilityChangeHandler)

    return () => {
      clearInterval(pollInterval)
      document.removeEventListener('visibilitychange', visibilityChangeHandler)
    }
  }, [token, fetchUnreadCount])

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    fetchUnreadCount
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
