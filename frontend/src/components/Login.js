import React, { useState, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import Loader from './utils/Loader' // Import the Loader component

const Login = (props) => {
  useEffect(() => {
    document.title = 'Login | Wryta'
  }, [])

  const hostLink = process.env.REACT_APP_HOSTLINK
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: ''
  })
  const [loading, setLoading] = useState(false) // State for loader
  const location = useLocation()

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      navigate('/') // Redirect to home page
      return
    }

    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    if (token) {
      localStorage.setItem('token', token)
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
      navigate('/')
    }
  }, [location.search, navigate])

  const logInWithGoogle = async () => {
    setLoading(true)
    try {
      window.open(`${hostLink}/auth/google`, '_self')
    } catch (error) {
      props.showAlert('An error occurred during Google login!', '#F8D7DA')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
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
          name: json.name,
          image: json.image || '',
          username: credentials.identifier
        })
        navigate('/')
        props.showAlert('Logged in successfully!', '#D4EDDA')
      } else {
        props.showAlert('Invalid Credentials!', '#F8D7DA')
      }
    } catch (error) {
      props.showAlert('An error occurred during login!', '#F8D7DA')
    } finally {
      setLoading(false)
    }
  }

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  return (
    <div className='relative flex min-h-full flex-1 flex-col justify-center px-6 py-8 lg:px-8'>
      {/* Loader overlay */}
      {loading && (
        <div className='absolute mt-28 inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm'>
          <Loader />
        </div>
      )}

      <div className='sm:mx-auto sm:w-full sm:max-w-sm mt-16'>
        <h2 className='mt-5 text-center text-xl md:text-2xl font-bold leading-9 tracking-tight text-white'>
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
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className='flex flex-col text-center mt-4 gap-2 md:hidden'>
          <Link
            to='/request-reset-password'
            className='text-sm font-semibold leading-6 text-white hover:text-red-400'
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
            className='text-sm font-semibold leading-6 text-white hover:text-red-400'
          >
            Forgot Password?
          </Link>
        </div>

        <button
          className='mt-4 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
          onClick={logInWithGoogle}
          disabled={loading}
        >
          {loading ? 'Signing in with Google...' : 'Sign in with Google 🚀'}
        </button>
      </div>
    </div>
  )
}

export default Login
