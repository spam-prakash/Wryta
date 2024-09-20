import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import notebook from '../assets/notes.png'

const Navbar = (props) => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
    props.showAlert('Logged Out', '#D4EDDA')
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <nav className='z-30 flex bg-black py-3 justify-between fixed w-full items-center px-4 md:px-8'>
        {/* Logo Section */}
        <div className='flex gap-3 items-center'>
          <Link to='/'>
            <img className='w-11 cursor-pointer' src={notebook} alt='Notebook Logo' />
          </Link>
          <Link to='/'>
            <span className='text-3xl font-bold font-serif cursor-pointer text-white'>
              iNote<span className='text-[#FDC116]'>Book</span>
            </span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className='hidden md:flex gap-3 items-center'>
          {location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup' && (
            <Link
              className='bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md'
              to='/'
            >
              Home
            </Link>
          )}
          {!localStorage.getItem('token')
            ? (
              <>
                {location.pathname !== '/login' && (
                  <Link
        className='bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md'
        to='/login'
      >
        Login
                </Link>
                )}
                {location.pathname !== '/signup' && (
                  <Link
        className='bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md'
        to='/signup'
      >
        Signup
                </Link>
                )}
              </>
              )
            : (
              <>
                {location.pathname !== '/profile' && (
                  <Link
        className='bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md'
        to='/profile'
      >
        Profile
                </Link>
                )}
                <button
                  className='bg-sky-600 hover:bg-sky-400 transition-all duration-300 py-1 px-3 font-bold text-white text-sm rounded-md'
                  onClick={handleLogout}
                >
                  Logout
              </button>
              </>
              )}
        </div>

        {/* Hamburger Icon for Mobile */}
        <div className='md:hidden flex items-center'>
          <button onClick={toggleMenu} className='text-white focus:outline-none'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16m-7 6h7' />
            </svg>
          </button>
        </div>

        {/* Sidebar Menu */}
        <div
          className={`fixed inset-0 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}  transition-transform duration-300 ease-in-out z-40`}
        >
          <div
            className='absolute inset-0 bg-black opacity-50'
            onClick={toggleMenu}
          />
          <div className='fixed right-0 top-0 h-full bg-black w-64 text-white flex flex-col items-center py-6'>
            <div className='text-xl font-semibold mb-8'>Menu</div>
            <ul className='flex flex-col items-center gap-6'>
              {location.pathname !== '/' && (
                <Link to='/' onClick={toggleMenu}>
                  <li className='hover:text-sky-400 transition duration-200'>Home</li>
                </Link>
              )}
              {!localStorage.getItem('token')
                ? (
                  <>
                    {location.pathname !== '/login' && (
                      <Link to='/login' onClick={toggleMenu}>
        <li className='hover:text-sky-400 transition duration-200'>Login</li>
      </Link>
                    )}
                    {location.pathname !== '/signup' && (
                      <Link to='/signup' onClick={toggleMenu}>
        <li className='hover:text-sky-400 transition duration-200'>Signup</li>
      </Link>
                    )}
                  </>
                  )
                : (
                  <>
                    {location.pathname !== '/profile' && (
                      <Link to='/profile' onClick={toggleMenu}>
        <li className='hover:text-sky-400 transition duration-200'>Profile</li>
      </Link>
                    )}
                    <li
                      className='hover:text-sky-400 transition duration-200 cursor-pointer'
                      onClick={() => {
        handleLogout()
        toggleMenu()
      }}
                    >
                      Logout
                  </li>
                  </>
                  )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
