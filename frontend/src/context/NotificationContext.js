import { createContext, useState, useEffect, useCallback, useRef } from 'react'
import { socket } from '../socket'

export const NotificationContext = createContext()

export default function NotificationProvider ({ children }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const token = localStorage.getItem('token')
  const hostLink = process.env.REACT_APP_HOSTLINK
  const LIMIT = 8
  const socketInitialized = useRef(false)

  // -----------------------------
  // 📥 Add notification helper
  // -----------------------------
  const addNotification = useCallback((notification) => {
    setNotifications(prev => {
      const exists = prev.some(n => n._id === notification._id)
      if (exists) return prev
      return [notification, ...prev].slice(0)
    })
    setUnreadCount(prev => prev + 1)
  }, [])

  // -----------------------------
  // 📥 Fetch notifications
  // -----------------------------
  const fetchNotifications = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${hostLink}/api/notification`, {
        headers: { 'auth-token': token }
      })

      if (!res.ok) throw new Error('Failed to fetch notifications')

      const data = await res.json()
      const list = data.notifications || data || []

      setNotifications(list)
      setUnreadCount(list.filter(n => !n.isRead).length)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [token, hostLink])

  // -----------------------------
  // 📌 Mark single notification
  // -----------------------------
  const markAsRead = useCallback(async (id) => {
    if (!token) return
    try {
      const res = await fetch(`${hostLink}/api/notification/read/${id}`, {
        method: 'PUT',
        headers: { 'auth-token': token }
      })

      if (!res.ok) throw new Error('Failed to mark as read')

      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)))
      setUnreadCount(prev => Math.max(prev - 1, 0))
    } catch (err) {
      console.error(err)
    }
  }, [token, hostLink])

  // -----------------------------
  // 📌 Mark all as read
  // -----------------------------
  const markAllAsRead = useCallback(async () => {
    if (!token || unreadCount === 0) return
    try {
      const res = await fetch(`${hostLink}/api/notification/read-all`, {
        method: 'PUT',
        headers: { 'auth-token': token }
      })

      if (!res.ok) throw new Error('Failed to mark all as read')

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error(err)
    }
  }, [token, hostLink, unreadCount])

  // -----------------------------
  // 🔌 SOCKET.IO INTEGRATION
  // -----------------------------
  useEffect(() => {
    if (!token || socketInitialized.current) return

    let userId
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userId = payload.user?.id || payload.id
    } catch (err) {
      console.error('Invalid token')
      return
    }

    socket.connect()
    socket.emit('register', userId)

    // Listen to new notifications
    socket.on('new-notification', addNotification)

    socketInitialized.current = true

    return () => {
      socket.off('new-notification', addNotification)
      socket.disconnect()
      socketInitialized.current = false
    }
  }, [token, addNotification])

  // -----------------------------
  // 🚀 Initial load
  // -----------------------------
  useEffect(() => {
    if (token) fetchNotifications()
    else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [token, fetchNotifications])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
