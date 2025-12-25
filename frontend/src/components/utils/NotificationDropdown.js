import { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { NotificationContext } from '../../context/NotificationContext'
import { useNavigate } from 'react-router-dom'

export default function NotificationDropdown ({ onClose }) {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
    refreshNotifications
  } = useContext(NotificationContext)

  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const hasInitializedRef = useRef(false)

  // Get latest 8 notifications
  const latestNotifications = notifications.slice(0, 8)

  // Click outside to close
  const handleClickOutside = useCallback(
    (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest('button[aria-label="Notifications"], .notification-bell')
      ) {
        onClose?.()
      }
    },
    [onClose]
  )

  // Escape key to close
  const handleEscKey = useCallback((event) => {
    if (event.key === 'Escape') onClose?.()
  }, [onClose])

  // Handle resize
  const handleResize = useCallback(() => setIsDesktop(window.innerWidth >= 768), [])

  useEffect(() => {
    if (isDesktop) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscKey)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
      window.removeEventListener('resize', handleResize)
    }
  }, [isDesktop, handleClickOutside, handleEscKey, handleResize])

  // Refresh notifications on first open
  useEffect(() => {
    if (isDesktop && !hasInitializedRef.current) {
      const refresh = async () => {
        setIsRefreshing(true)
        try {
          await refreshNotifications()
        } finally {
          setIsRefreshing(false)
          hasInitializedRef.current = true
        }
      }
      refresh()
    }
    return () => { hasInitializedRef.current = false }
  }, [isDesktop, refreshNotifications])

  const getNotificationLink = useCallback((n) => {
    if (n.type === 'follow') return `/u/${n.sender?.username}`
    if (n.note) return `/note/${n.note._id}`
    return '#'
  }, [])

  const formatTime = useCallback((date) => {
    try {
      const now = new Date()
      const notificationDate = new Date(date)
      if (isNaN(notificationDate.getTime())) return 'Recently'

      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60))
      const diffInHours = Math.floor(diffInMinutes / 60)
      const diffInDays = Math.floor(diffInHours / 24)

      if (diffInMinutes < 1) return 'Just now'
      else if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      else if (diffInHours < 24) return `${diffInHours}h ago`
      else if (diffInDays < 7) return notificationDate.toLocaleDateString('en-US', { weekday: 'short' })
      else if (diffInDays < 365) return notificationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      else return notificationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return 'Recently'
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try { await refreshNotifications() } finally { setIsRefreshing(false) }
  }, [isRefreshing, refreshNotifications])

  const handleClose = useCallback(() => onClose?.(), [onClose])
  const handleSeeAll = useCallback(() => { handleClose(); navigate('/notifications') }, [handleClose, navigate])

  const handleNotificationClick = useCallback((n) => {
    if (!n.isRead) markAsRead(n._id)
    const link = getNotificationLink(n)
    if (link !== '#') navigate(link)
    handleClose()
  }, [markAsRead, getNotificationLink, navigate, handleClose])

  if (!isDesktop) return null

  return (
    <div ref={dropdownRef} className='notification-dropdown absolute right-0 mt-2 w-96 bg-[#0a1122] border border-gray-800 rounded-lg shadow-2xl z-50'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 border-b border-gray-800 sticky top-0 bg-[#0a1122] z-10 rounded-t-lg'>
        <div className='flex items-center gap-2'>
          <svg className='w-4 h-4 text-[#FDC116]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
          </svg>
          <h3 className='font-bold text-white'>Notifications</h3>
          {unreadCount > 0 && (
            <span className='bg-[#FDC116] text-black text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <button onClick={handleRefresh} disabled={isRefreshing} className='text-xs text-[#FDC116] hover:text-white transition-colors px-2 py-1 disabled:opacity-50 flex items-center gap-1' aria-label='Refresh notifications'>
            {isRefreshing
              ? <div className='w-3 h-3 border-2 border-[#FDC116] border-t-transparent rounded-full animate-spin' />
              : <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
              </svg>}
          </button>
          {unreadCount > 0 && <button onClick={markAllAsRead} className='text-xs text-[#FDC116] hover:text-white px-2 py-1' title='Mark all as read'>Mark all read</button>}
          <button onClick={handleClose} className='text-gray-400 hover:text-[#FDC116] focus:outline-none transition-colors'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
      </div>

      {/* Notification list - Show only latest 8 */}
      <div className='max-h-96 overflow-y-auto'>
        {latestNotifications.length === 0 ? (
          <div className='p-6 text-center text-gray-500 text-sm'>No notifications yet</div>
        ) : latestNotifications.map((n, index) => (
          <div
            key={n._id || `notification-${index}-${Date.now()}`}
            className={`px-4 py-3 border-b border-gray-800 hover:bg-[#1a2238] transition-colors cursor-pointer ${!n.isRead ? 'bg-[#1a2238]' : ''}`}
            onClick={() => handleNotificationClick(n)}
          >
            {/* Avatar and Content */}
            <div className='flex gap-3'>
              <div className='flex-shrink-0 relative'>
                <img
                  src={n.sender?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(n.sender?.username || 'User')}&background=0a1122&color=FDC116`}
                  alt={n.sender?.username || 'User'}
                  className='w-10 h-10 rounded-full object-cover border border-gray-700 cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!n.isRead) markAsRead(n._id)
                    navigate(`/u/${n.sender?.username}`)
                    handleClose()
                  }}
                />
                {!n.isRead && <span className='absolute -top-1 -right-1 w-3 h-3 bg-[#FDC116] rounded-full border-2 border-[#0a1122]' />}
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex justify-between items-start'>
                  <div>
                    <div
                      className='font-bold text-white hover:text-[#FDC116] transition-colors cursor-pointer'
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!n.isRead) markAsRead(n._id)
                        navigate(`/u/${n.sender?.username}`)
                        handleClose()
                      }}
                    >
                      {n.sender?.username || 'Unknown User'}
                    </div>
                    <div className='flex items-center gap-2 mt-1'>
                      {n.type === 'like' && (
                        <span className='text-[#FDC116]'>
                          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
                          </svg>
                        </span>
                      )}
                      <span className='text-gray-300 text-sm flex-1 line-clamp-2'>{n.message || 'New notification'}</span>
                    </div>
                  </div>
                  <span className='text-xs text-gray-500 whitespace-nowrap ml-2 flex-shrink-0'>{n.createdAt ? formatTime(n.createdAt) : 'Recently'}</span>
                </div>
                {n.note?.content && (
                  <div className='mt-2 p-2 bg-gray-900 rounded border-l-2 border-[#FDC116]'>
                    <p className='text-xs text-gray-400 line-clamp-2'>"{n.note.content.substring(0, 80)}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className='border-t border-gray-800 rounded-b-lg overflow-hidden'>
        <button onClick={handleSeeAll} className='w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-400 hover:text-[#FDC116] hover:bg-[#1a2238] transition-all duration-300'>
          <span>See All Notifications</span>
          <svg className='w-4 h-4 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
          </svg>
        </button>
      </div>
    </div>
  )
}
