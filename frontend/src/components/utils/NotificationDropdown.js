import { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { NotificationContext } from '../../context/NotificationContext'
import { Link, useNavigate } from 'react-router-dom'

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

  // Handle click outside dropdown
  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      const isNotificationBell = event.target.closest('button[aria-label="Notifications"]') ||
        event.target.closest('.notification-bell')

      if (!isNotificationBell) {
        onClose?.()
      }
    }
  }, [onClose])

  // Handle escape key
  const handleEscKey = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose?.()
    }
  }, [onClose])

  // Handle resize
  const handleResize = useCallback(() => {
    setIsDesktop(window.innerWidth >= 768)
  }, [])

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

  // Refresh notifications when dropdown opens
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

    return () => {
      hasInitializedRef.current = false
    }
  }, [isDesktop, refreshNotifications])

  const getNotificationLink = useCallback((n) => {
    if (n.type === 'follow') {
      return `/u/${n.sender?.username}`
    }

    if (n.note) {
      return `/note/${n.note._id}`
    }

    return '#'
  }, [])

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  const handleNotificationClick = useCallback((n) => {
    if (!n.isRead) {
      markAsRead(n._id)
    }

    const link = getNotificationLink(n)

    if (isDesktop) {
      handleClose()
      setTimeout(() => {
        if (link !== '#') {
          navigate(link)
        }
      }, 100)
    } else if (link !== '#') {
      navigate(link)
    }
  }, [markAsRead, isDesktop, handleClose, navigate, getNotificationLink])

  // Format time
  const formatTime = useCallback((date) => {
    try {
      const now = new Date()
      const notificationDate = new Date(date)

      if (isNaN(notificationDate.getTime())) {
        return 'Recently'
      }

      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60))
      const diffInHours = Math.floor(diffInMinutes / 60)
      const diffInDays = Math.floor(diffInHours / 24)

      if (diffInMinutes < 1) {
        return 'Just now'
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`
      } else if (diffInDays < 7) {
        return notificationDate.toLocaleDateString('en-US', { weekday: 'short' })
      } else if (diffInDays < 365) {
        return notificationDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      } else {
        return notificationDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }
    } catch (error) {
      return 'Recently'
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      await refreshNotifications()
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, refreshNotifications])

  const handleSeeAll = useCallback(() => {
    handleClose()
    navigate('/notifications')
  }, [handleClose, navigate])

  // Don't render dropdown on mobile
  if (!isDesktop) {
    return null
  }

  // Show loading state
  if (isRefreshing && notifications.length === 0) {
    return (
      <div
        ref={dropdownRef}
        className='notification-dropdown absolute right-0 mt-2 w-96 bg-[#0a1122] border border-gray-800 rounded-lg shadow-2xl z-50'
      >
        <div className='flex items-center justify-between px-4 py-3 border-b border-gray-800'>
          <div className='flex items-center gap-2'>
            <svg className='w-4 h-4 text-[#FDC116]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
            </svg>
            <h3 className='font-bold text-white'>Notifications</h3>
          </div>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-[#FDC116] focus:outline-none transition-colors'
            aria-label='Close notifications'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
        <div className='p-6 text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#FDC116] mx-auto' />
          <p className='text-gray-500 text-sm mt-2'>Loading notifications...</p>
        </div>
      </div>
    )
  }

  if (notifications.length === 0 && !isRefreshing) {
    return (
      <div
        ref={dropdownRef}
        className='notification-dropdown absolute right-0 mt-2 w-96 bg-[#0a1122] border border-gray-800 rounded-lg shadow-2xl z-50'
      >
        <div className='flex items-center justify-between px-4 py-3 border-b border-gray-800'>
          <div className='flex items-center gap-2'>
            <svg className='w-4 h-4 text-[#FDC116]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
            </svg>
            <h3 className='font-bold text-white'>Notifications</h3>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='text-xs text-[#FDC116] hover:text-white transition-colors px-2 py-1 disabled:opacity-50 flex items-center gap-1'
              aria-label='Refresh notifications'
            >
              {isRefreshing
                ? (
                  <>
                    <div className='w-3 h-3 border-2 border-[#FDC116] border-t-transparent rounded-full animate-spin' />
                    <span>Refreshing</span>
                  </>
                  )
                : (
                  <>
                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                    </svg>
                    <span>Refresh</span>
                  </>
                  )}
            </button>
            <button
              onClick={handleClose}
              className='text-gray-400 hover:text-[#FDC116] focus:outline-none transition-colors'
              aria-label='Close notifications'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>
        <div className='p-6 text-center'>
          <div className='text-gray-400 mb-2'>
            <svg className='w-12 h-12 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
            </svg>
          </div>
          <p className='text-gray-500 text-sm'>No notifications yet</p>
          <p className='text-gray-600 text-xs mt-1'>When you get notifications, they'll show up here</p>
          <button
            onClick={handleSeeAll}
            className='mt-4 text-xs text-[#FDC116] hover:text-white transition-colors px-3 py-1.5 border border-[#FDC116] rounded flex items-center gap-2 mx-auto'
          >
            <span>See All Notifications</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={dropdownRef}
      className='notification-dropdown absolute right-0 mt-2 w-96 bg-[#0a1122] border border-gray-800 rounded-lg shadow-2xl z-50'
    >
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
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className='text-xs text-[#FDC116] hover:text-white transition-colors px-2 py-1 disabled:opacity-50 flex items-center gap-1'
            aria-label='Refresh notifications'
          >
            {isRefreshing
              ? (
                <div className='w-3 h-3 border-2 border-[#FDC116] border-t-transparent rounded-full animate-spin' />
                )
              : (
                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                </svg>
                )}
          </button>

          {/* Mark all as read button */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className='text-xs text-[#FDC116] hover:text-white transition-colors px-2 py-1'
              title='Mark all as read'
            >
              Mark all read
            </button>
          )}

          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-[#FDC116] focus:outline-none transition-colors'
            aria-label='Close notifications'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className='max-h-96 overflow-y-auto'>
        {notifications.map((n, index) => (
          <div
            key={n._id || `notification-${index}-${Date.now()}`}
            className={`px-4 py-3 border-b border-gray-800 hover:bg-[#1a2238] transition-colors cursor-pointer ${
              !n.isRead ? 'bg-[#1a2238]' : ''
            }`}
            onClick={() => handleNotificationClick(n)}
          >
            <div className='flex gap-3'>
              {/* Avatar */}
              <div className='flex-shrink-0'>
                <div className='relative'>
                  <img
                    src={
                      n.sender?.image ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(n.sender?.name || 'User')}&background=0a1122&color=FDC116`
                    }
                    alt={n.sender?.name || 'User'}
                    className='w-10 h-10 rounded-full object-cover border border-gray-700'
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(n.sender?.name || 'User')}&background=0a1122&color=FDC116`
                    }}
                  />
                  {!n.isRead && (
                    <span className='absolute -top-1 -right-1 w-3 h-3 bg-[#FDC116] rounded-full border-2 border-[#0a1122]' />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className='flex-1 min-w-0'>
                <div className='flex justify-between items-start'>
                  <div>
                    {/* Username */}
                    <div className='font-bold text-white hover:text-[#FDC116] transition-colors'>
                      {n.sender?.name || 'Unknown User'}
                    </div>

                    {/* Notification type icon */}
                    <div className='flex items-center gap-2 mt-1'>
                      {n.type === 'like' && (
                        <span className='text-[#FDC116]'>
                          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
                          </svg>
                        </span>
                      )}
                      {n.type === 'follow' && (
                        <span className='text-[#FDC116]'>
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' />
                          </svg>
                        </span>
                      )}
                      {n.type === 'comment' && (
                        <span className='text-[#FDC116]'>
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' />
                          </svg>
                        </span>
                      )}
                      {n.type === 'mention' && (
                        <span className='text-[#FDC116]'>
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' />
                          </svg>
                        </span>
                      )}

                      {/* Message */}
                      <span className='text-gray-300 text-sm flex-1 line-clamp-2'>
                        {n.message || 'New notification'}
                      </span>
                    </div>
                  </div>

                  {/* Time */}
                  <span className='text-xs text-gray-500 whitespace-nowrap ml-2 flex-shrink-0'>
                    {n.createdAt ? formatTime(n.createdAt) : 'Recently'}
                  </span>
                </div>

                {/* Preview for notes */}
                {n.note?.content && (
                  <div className='mt-2 p-2 bg-gray-900 rounded border-l-2 border-[#FDC116]'>
                    <p className='text-xs text-gray-400 line-clamp-2'>
                      "{n.note.content.substring(0, 80)}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - See All button */}
      <div className='border-t border-gray-800 rounded-b-lg overflow-hidden'>
        <button
          onClick={handleSeeAll}
          className='w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-400 hover:text-[#FDC116] hover:bg-[#1a2238] transition-all duration-300'
        >
          <span>See All Notifications</span>
          <svg
            className='w-4 h-4 transition-transform duration-300'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
          </svg>
        </button>
      </div>
    </div>
  )
}
