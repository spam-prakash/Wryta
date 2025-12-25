import { useContext, useState } from 'react'
import { NotificationContext } from '../context/NotificationContext'
import { Link } from 'react-router-dom'

export default function NotificationsPage () {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  } = useContext(NotificationContext)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const getNotificationLink = (n) => {
    if (n.type === 'follow') return `/u/${n.sender?.username}`
    if (n.note) return `/note/${n.note._id}`
    return '#'
  }

  const formatTime = (date) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    else if (diffInHours < 24) return `${diffInHours}h ago`
    else {
      return notificationDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const handleRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      await refreshNotifications()
    } finally {
      setIsRefreshing(false)
    }
  }

  const hasUnread = notifications.some((n) => !n.isRead)

  return (
    <div className='max-w-2xl mx-auto px-4 pt-24 pb-20'>
      {/* Header */}
      <div className='mb-4 border-b border-gray-800 pb-3'>
        <div className='flex flex-col'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2'>
              <svg
                className='w-5 h-5 text-[#FDC116]'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                />
              </svg>
              <h1 className='text-lg font-bold text-white'>Notifications</h1>
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className='bg-[#FDC116] text-black text-xs font-bold px-2 py-0.5 rounded-full'>
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </div>

            <div className='flex items-center gap-3'>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className='text-xs text-white hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50'
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
                      <svg
                        className='w-3.5 h-3.5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                        />
                      </svg>
                      <span>Refresh</span>
                    </>
                    )}
              </button>
            </div>
          </div>

          {hasUnread && (
            <div className='self-end'>
              <button
                onClick={markAllAsRead}
                className='text-sm text-[#FDC116] hover:text-white transition-colors'
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div>
        {notifications.map((n) => (
          <div
            key={n._id}
            className={`py-3 px-1 hover:bg-[#1a2238] transition-colors ${
              !n.isRead ? 'bg-[#1a2238]/30' : ''
            }`}
          >
            <div className='flex gap-3 pb-1 border-b-2 border-gray-600'>
              {/* Avatar */}
              <Link to={`/u/${n.sender?.username}`} className='flex-shrink-0'>
                <div className='relative'>
                  <img
                    src={
                      n.sender?.image ||
                      `https://ui-avatars.com/api/?name=${n.sender?.name || 'User'}&background=0a1122&color=FDC116`
                    }
                    alt={n.sender?.name || 'User'}
                    className='w-9 h-9 rounded-full object-cover'
                  />
                  {!n.isRead && (
                    <span className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FDC116] rounded-full border-2 border-[#0a1122]' />
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className='flex-1 min-w-0'>
                <div className='flex justify-between items-start'>
                  <div>
                    <Link
                      to={`/u/${n.sender?.username}`}
                      className='font-semibold text-white hover:text-[#FDC116] transition-colors text-sm'
                    >
                      {n.sender?.username}
                    </Link>

                    <div className='flex items-center gap-1 mt-0.5'>
                      {n.type === 'like' && (
                        <span className='text-[#FDC116]'>
                          <svg
                            className='w-3.5 h-3.5'
                            fill='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
                          </svg>
                        </span>
                      )}
                      {n.type === 'follow' && (
                        <span className='text-[#FDC116]'>
                          <svg
                            className='w-3.5 h-3.5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                            />
                          </svg>
                        </span>
                      )}
                      {n.type === 'comment' && (
                        <span className='text-[#FDC116]'>
                          <svg
                            className='w-3.5 h-3.5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
                            />
                          </svg>
                        </span>
                      )}

                      <Link
                        to={getNotificationLink(n)}
                        onClick={() => !n.isRead && markAsRead(n._id)}
                        className='text-gray-300 hover:text-white text-sm transition-colors'
                      >
                        {n.message}
                      </Link>
                    </div>
                  </div>

                  <div className='flex flex-col items-end gap-1'>
                    <span className='text-xs text-gray-500 whitespace-nowrap'>
                      {formatTime(n.createdAt)}
                    </span>
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className='text-xs text-[#FDC116] hover:text-white transition-colors'
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>

                {n.note?.content && (
                  <div className='mt-2 p-2 bg-gray-900/50 rounded text-xs text-gray-400'>
                    "{n.note.content.substring(0, 60)}..."
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
