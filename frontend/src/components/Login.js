import React, { useState, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = (props) => {
  useEffect(() => { document.title = 'Login | iNoteBook' }, [])
  const hostLink = process.env.REACT_APP_HOSTLINK
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: ''
  })

  const location = useLocation()

  useEffect(() => {
    // Check if the token is already in localStorage
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      navigate('/') // Redirect to home page
      return // Exit early
    }

    // Extract the token from the URL
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    if (token) {
      // Set the token in local storage
      localStorage.setItem('token', token)

      // Clear the token from the URL to prevent duplicate processing
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)

      // Redirect to the desired page
      navigate('/')
    }
  }, [location.search, navigate])

  const logInWithGoogle = () => {
    window.open(`${hostLink}/auth/google`, '_self')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch(`${hostLink}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        identifier: credentials.identifier,
        password: credentials.password
      })
    })
    const json = await response.json()

    if (json.success) {
      localStorage.setItem('token', json.authToken)
      props.setUser({
        email: json.email,
        name: json.name
      })
      navigate('/')
      props.showAlert('Logged in successfully!', '#D4EDDA')
    } else {
      props.showAlert('Invalid Credentials!', '#F8D7DA')
    }
  }

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  return (
    <>
      <div className='flex min-h-full flex-1 flex-col justify-center px-6 py-8 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-sm mt-16'>
          <h2 className='mt-5 text-center text-xl md:text-2xl  font-bold leading-9 tracking-tight text-white'>
            Sign in to your account
          </h2>
        </div>

        <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            <div>
              <label htmlFor='identifier' className='block text-sm font-medium leading-6 text-white'>
                Email or Username
              </label>
              <div className='mt-2'>
                <input
                  id='identifier'
                  name='identifier'
                  type='text'
                  autoComplete='username'
                  required
                  value={credentials.identifier}
                  placeholder='Enter your Email or Username here'
                  className='block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  onChange={onChange}
                />
              </div>
            </div>

            <div>
              <div className='flex items-center justify-between'>
                <label htmlFor='password' className='block text-sm font-medium leading-6 text-white'>
                  Password
                </label>
              </div>
              <div className='mt-2'>
                <input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  required
                  value={credentials.password}
                  placeholder='Enter your password here'
                  className='block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  onChange={onChange}
                />
              </div>
            </div>

            <div>
              <button
                type='submit'
                className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
              >
                Sign in
              </button>
            </div>
          </form>

          <div className='flex flex-col text-center mt-4 gap-2 md:hidden'>
            <Link
              to='/request-reset-password'
              className='text-sm font-semibold leading-6  text-white hover:text-red-400'
            >
              Forgot Password?
            </Link>

            <Link
              to='/signup'
              className='text-sm font-semibold leading-6 text-white hover:text-indigo-500'
            >
              Don't have an account? <span className='text-indigo-600 hover:text-indigo-500'>Sign Up</span>
            </Link>
          </div>

          <div className='mt-4 justify-between hidden md:flex'>
            <Link
              to='/signup'
              className='text-sm font-semibold leading-6 text-white hover:text-indigo-500'
            >
              Don't have an account? <span className='text-indigo-600 hover:text-indigo-500'>Sign Up</span>
            </Link>
            <Link
              to='/request-reset-password'
              className='text-sm font-semibold leading-6  text-white hover:text-red-400'
            >
              Forgot Password?
            </Link>
          </div>

          {/* GOOGLE SIGNIN */}
          <button
            className='mt-4 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
            onClick={() => logInWithGoogle()}
          >
            Sign in with Google 🚀
          </button>
        </div>
      </div>
    </>
  )
}

export default Login
