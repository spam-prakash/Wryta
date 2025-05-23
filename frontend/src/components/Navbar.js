import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiUser, FiLogOut, FiHome, FiInfo, FiLogIn, FiUserPlus } from 'react-icons/fi' // Icons
import defaultUserIcon from '../assets/user.png' // Default user icon
import notebook from '../assets/notes.png' // Notebook logo

const Navbar = (props) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const profileRef = useRef(null)

  const user = props.user
  const [image, setImage] = useState(
    user?.image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || 'default'}`
  ) // Initialize with user image or default avatar

  // Update the image whenever `props.user` changes
  useEffect(() => {
    if (user && user.image) {
      setImage(user.image) // Use the user's image if available
    } else {
      setImage(`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || 'default'}`) // Fallback to DiceBear avatar
    }
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
    props.showAlert('Logged Out!', '#D4EDDA')
    setIsProfileOpen(false)
    props.setIsAuthenticated(false) // Reset authentication state
    props.setUser(null) // Reset user state
  }

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleProfileClick = () => {
    if (user && user.username) {
      navigate(`/${user.username}`)
      window.location.reload() // Force reload to ensure the profile page updates
    }
  }

  const isLoggedIn = !!localStorage.getItem('token')

  return (
    <nav className='z-30 flex bg-black py-3 justify-between fixed w-full items-center px-4 md:px-8'>
      {/* Logo */}
      <div className='flex gap-3 items-center'>
        <Link to='/'>
          <img className='md:size-11 size-7 cursor-pointer' src={notebook} alt='Logo' />
        </Link>
        <Link to='/'>
          <span className='md:text-3xl text-xl font-bold font-serif cursor-pointer text-white'>
            iNote<span className='text-[#FDC116]'>Book</span>
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
              className='w-10 h-10 rounded-full cursor-pointer'
              onClick={toggleProfileMenu}
              onError={(e) => {
                e.target.src = defaultUserIcon // Fallback to default image if the user's image fails to load
              }}
            />

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className='absolute right-0 mt-2 w-36 bg-[#0a1122] rounded-lg shadow-md z-100'>
                <span
                  className='flex cursor-pointer items-center text-white hover:bg-[#28254a5e] px-4 py-2'
                  onClick={() => {
                    setIsProfileOpen(false)
                    handleProfileClick()
                  }}
                >
                  <FiUser className='mr-2' />
                  <span className=''>My Profile</span>
                </span>
                <button
                  className='flex items-center w-full text-left text-white hover:bg-[#28254a5e] px-4 py-2'
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
