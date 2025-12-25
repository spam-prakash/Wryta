import { useContext, useState } from 'react'
import { NotificationContext } from '../../context/NotificationContext'
import NotificationDropdown from './NotificationDropdown'

// NotificationBell.jsx
const NotificationBell = ({ isActive }) => {
  const { notifications } = useContext(NotificationContext)
  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <button
      className={`notification-bell relative p-2 rounded-full hover:bg-gray-800 transition-colors ${
        isActive ? 'bg-gray-800' : ''
      }`}
      aria-label='Notifications'
    >
      <svg
        className='w-6 h-6 text-white'
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

      {unreadCount > 0 && (
        <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
          {unreadCount}
        </span>
      )}
    </button>
  )
}

export default NotificationBell
