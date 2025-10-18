import React, { useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const UserListModal = ({ title, users = [], onClose }) => {
  const modalRef = useRef(null)
  const navigate = useNavigate()
  const imageAPI = process.env.REACT_APP_IMAGEAPI

  // console.log(users)

  // ✅ Close when clicking outside modal
  const handleClickOutside = useCallback(
    (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    },
    [onClose]
  )

  // ✅ Handle Escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [handleClickOutside, onClose])

  // ✅ Handle user click navigation
  const handleUserClick = (username) => {
    onClose()
    // Navigate to user profile within React Router
    setTimeout(() => {
      navigate(`/u/${username}`)
    }, 0)
  }

  return (
    <div className='fixed inset-0 bg-opacity-50 md:backdrop-blur-sm flex items-center justify-center z-50 backdrop-blur-sm '>
      <div
        ref={modalRef}
        className='bg-[#0a0d22] w-full max-w-md rounded-2xl shadow-lg overflow-hidden border  border-gray-700 mx-6 '
      >
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-gray-700'>
          <h2 className='text-lg font-semibold text-gray-100'>{title}</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-200 transition'
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className='max-h-96 overflow-y-auto divide-y divide-gray-700'>
          {users.length > 0
            ? (
                users.map((user) => (
                  <div
                    key={user._id || user.id || user.username}
                    onClick={() => handleUserClick(user.username)}
                    className='flex items-center gap-3 px-4 py-3 hover:bg-gray-800/60 cursor-pointer transition  '
                  >
                    <img
                      src={user.profilePic || `${imageAPI}${encodeURIComponent(user.username)}`}
                      onError={(e) => {
                        e.target.onerror = null // prevent infinite loop
                        e.target.src = `${imageAPI}${encodeURIComponent(user.username)}`
                      }}
                      alt={user.username}
                      className='w-10 h-10 rounded-full object-cover border border-gray-700'
                    />
                    <div className='flex flex-col'>
                      <span className='text-gray-200 font-medium'>{user.name}</span>
                      <span className='text-gray-400 text-sm'>@{user.username}</span>
                    </div>
                  </div>
                ))
              )
            : (
              <p className='text-gray-400 text-center py-6'>No users found.</p>
              )}
        </div>
      </div>
    </div>
  )
}

export default UserListModal
