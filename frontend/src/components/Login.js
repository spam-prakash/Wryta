import React, { useState, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'


const Login = (props) => {  
    useEffect(() => { document.title = 'Login | iNoteBook' }, []);
  const hostLink = process.env.REACT_APP_HOSTLINK
  // console.log('Host Link:', hostLink) // Debugging
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })

  const location = useLocation()

  useEffect(() => {
    // Check if the token is already in localStorage
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      // console.log('Token already stored in localStorage:', storedToken)
      navigate('/') // Redirect to home page
      return // Exit early
    }

    // Extract the token from the URL
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    // console.log('Query String:', location.search) // Debugging
    // console.log('Token:', token) // Debugging

    if (token) {
      // Set the token in local storage
      localStorage.setItem('token', token)
      // console.log('Token stored in localStorage:', localStorage.getItem('token')) // Debugging

      // Clear the token from the URL to prevent duplicate processing
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)

      // Redirect to the desired page
      navigate('/')
    } else {
      // console.log('No token found')
    }
  }, [location.search, navigate]) // Only depend on location.search and navigate

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
        username: credentials.username,
        password: credentials.password
      })
    })
    const json = await response.json()

    if (json.success) {
      localStorage.setItem('token', json.authToken)
      props.setUser({
        username: credentials.username,
        email: json.email,
        name: json.name
      })
      navigate('/')
      props.showAlert('Logged in successfully !', '#D4EDDA')
    } else {
      props.showAlert('Invalid Credentials !', '#F8D7DA')
    }
  }

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  return (
    <>
      <div className='flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-sm mt-24'>
          <h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white'>
            Sign in to your account
          </h2>
        </div>

        <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            <div>
              <label htmlFor='username' className='block text-sm font-medium leading-6 text-white'>
                Username
              </label>
              <div className='mt-2'>
                <input
                  id='username'
                  name='username'
                  type='text'
                  autoComplete='username'
                  required
                  value={credentials.username}
                  placeholder='Enter your username'
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
                  placeholder='Enter your password'
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
          {/* GOOGLE SIGNIN */}
          <button
            className='mt-4 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
            onClick={() => logInWithGoogle()}
          >
            Sign in with Google 🚀
          </button>

          <p className='mt-8 text-center text-sm text-gray-500'>
            Not a member?{' '}
            <Link to='/signup' className='font-semibold leading-6 text-indigo-600 hover:text-indigo-500'>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default Login
