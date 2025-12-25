import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiUser, FiLogOut, FiHome, FiInfo, FiLogIn, FiUserPlus } from 'react-icons/fi'
import defaultUserIcon from '../assets/user.png'
import notebook from '../assets/notes.png'
import NotificationBell from './utils/NotificationBell'
import NotificationDropdown from './utils/NotificationDropdown'

const Navbar = (props) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
  const navigate = useNavigate()
  const location = useLocation()
  const profileRef = useRef(null)
  const notificationButtonRef = useRef(null)
  const imageAPI = process.env.REACT_APP_IMAGEAPI

  const user = props.user
  const [image, setImage] = useState(
    user?.image || `${imageAPI}${encodeURIComponent(user?.username) || 'default'}`
  )

  // Update image whenever user changes
  useEffect(() => {
    if (!user) return

    const fallback = `${imageAPI}${encodeURIComponent(user?.username) || 'default'}`

    if (user.image) {
      const img = new Image()
      img.src = user.image

      img.onload = () => setImage(user.image)
      img.onerror = () => setImage(fallback)
    } else {
      setImage(fallback)
    }
  }, [user, imageAPI])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768
      setIsDesktop(desktop)
      // Close dropdown if switching to mobile
      if (!desktop && showNotifications) {
        setShowNotifications(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [showNotifications])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
    props.showAlert('Logged Out!', '#D4EDDA')
    setIsProfileOpen(false)
    setShowNotifications(false)
    props.setIsAuthenticated(false)
    props.setUser(null)
  }

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen)
    setShowNotifications(false)
  }

  const toggleNotifications = (e) => {
    // Prevent event from bubbling up
    e?.stopPropagation()

    if (isDesktop) {
      // Desktop: toggle dropdown
      setShowNotifications(!showNotifications)
      setIsProfileOpen(false)
    } else {
      // Mobile: navigate to notifications page
      navigate('/notifications')
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile dropdown
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }

      // Close notification dropdown (only on desktop)
      if (showNotifications && isDesktop) {
        // Check if click is on the notification bell button
        const isNotificationButton = notificationButtonRef.current?.contains(event.target)

        if (!isNotificationButton) {
          // Check if click is inside the dropdown (which handles its own closing)
          const dropdownElement = document.querySelector('.notification-dropdown')
          const isInsideDropdown = dropdownElement?.contains(event.target)

          if (!isInsideDropdown) {
            setShowNotifications(false)
          }
        }
      }
    }

    // Handle ESC key
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false)
        setShowNotifications(false)
      }
    }

    // Add event listeners
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [showNotifications, isDesktop])

  const handleProfileClick = () => {
    if (user && user.username) {
      navigate(`/u/${user.username}`)
    }
  }

  const isLoggedIn = !!localStorage.getItem('token')

  // Create a proper close function for the notification dropdown
  const closeNotificationDropdown = () => {
    setShowNotifications(false)
  }

  return (
    <nav className='z-30 flex bg-black py-3 justify-between fixed w-full items-center px-4 md:px-8'>
      {/* Logo */}
      <div className='flex gap-3 items-center'>
        <Link to='/'>
          <img className='md:size-11 size-7 cursor-pointer' src={notebook} alt='Logo' />
        </Link>
        <Link to='/'>
          <span className='md:text-3xl text-xl font-bold font-serif cursor-pointer text-white'>
            Wry<span className='text-[#FDC116]'>ta</span>
          </span>
        </Link>
      </div>

      {/* Navigation Buttons */}
      <div className='flex gap-3 items-center'>
        {isLoggedIn && location.pathname !== '/' && (
          <Link
            to='/'
            className='text-white flex items-center lg:gap-2 lg:px-3 gap-2 py-1 rounded-md hover:text-sky-400 transition-all duration-300'
          >
            <FiHome size={22} />
            <span className='hidden md:inline font-bold'>Home</span>
          </Link>
        )}
        {location.pathname !== '/about' && (
          <Link
            to='/about'
            className='text-white flex items-center lg:gap-2 lg:px-3 gap-2 py-1 rounded-md hover:text-sky-400 transition-all duration-300'
          >
            <FiInfo size={22} />
            <span className='hidden md:inline font-bold'>About</span>
          </Link>
        )}

        {isLoggedIn && (
          <div className='relative'>
            {/* Notification Bell - with separate ref */}
            <div ref={notificationButtonRef} onClick={toggleNotifications}>
              <NotificationBell
                isActive={showNotifications}
              />
            </div>

            {/* Notifications Dropdown - only show on desktop */}
            {showNotifications && isDesktop && (
              <NotificationDropdown
                onClose={closeNotificationDropdown}
              />
            )}
          </div>
        )}

        {!isLoggedIn ? (
          <>
            {location.pathname !== '/login' && (
              <Link
                to='/login'
                className='text-white flex items-center lg:gap-2 lg:px-3 gap-2 py-1 rounded-md hover:text-sky-400 transition-all duration-300'
              >
                <FiLogIn size={22} />
                <span className='hidden md:inline font-bold'>Login</span>
              </Link>
            )}
            {location.pathname !== '/signup' && (
              <Link
                to='/signup'
                className='text-white flex items-center gap-2 px-3 py-1 rounded-md hover:text-sky-400 transition-all duration-300'
              >
                <FiUserPlus size={22} />
                <span className='hidden md:inline font-bold'>Signup</span>
              </Link>
            )}
          </>
        ) : (
          <div ref={profileRef} className='relative'>
            {/* Profile Icon */}
            <img
              src={image}
              alt='User'
              className='w-10 h-10 rounded-full object-cover cursor-pointer'
              onClick={toggleProfileMenu}
              onError={(e) => {
                e.target.src = defaultUserIcon
              }}
            />

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className='absolute right-0 mt-2 w-36 bg-[#0a1122] rounded-lg shadow-md z-50 border border-gray-800'>
                <span
                  className='flex cursor-pointer items-center text-white hover:bg-[#28254a5e] px-4 py-2 rounded-t-lg'
                  onClick={() => {
                    setIsProfileOpen(false)
                    handleProfileClick()
                  }}
                >
                  <FiUser className='mr-2' />
                  <span className=''>My Profile</span>
                </span>
                <button
                  className='flex items-center w-full text-left text-white hover:bg-[#28254a5e] px-4 py-2 rounded-b-lg'
                  onClick={handleLogout}
                >
                  <FiLogOut className='mr-2' />
                  <span className=''>Log Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
