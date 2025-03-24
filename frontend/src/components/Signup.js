import React, { useState, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'

const Signup = (props) => {
  useEffect(() => { document.title = 'Signup | iNoteBook' }, [])
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    cpassword: '',
    name: '',
    email: '',
    otp: ''
  })
  const [otpSent, setOtpSent] = useState(false)
  const hostLink = process.env.REACT_APP_HOSTLINK
  const location = useLocation()

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      navigate('/')
      return;
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

  const logInWithGoogle = () => {
    window.open(`${hostLink}/auth/google`, '_self')
  };

  const handleGenerateOtp = async () => {
    const response = await fetch(`${hostLink}/api/auth/generateotp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: credentials.email })
    })
    const json = await response.json()
    if (json.success) {
      setOtpSent(true)
      props.showAlert('OTP sent to your email', '#D4EDDA')
    } else {
      props.showAlert('Failed to send OTP', '#F8D7DA')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, username, email, password, otp } = credentials
    const response = await fetch(`${hostLink}/api/auth/createuser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, username, email, password, otp })
    })
    const json = await response.json()
    if (json.success) {
      props.showAlert('New Account Created Successfully', '#D4EDDA')
      navigate('/login')
    } else {
      props.showAlert(json.error || 'Signup failed', '#F8D7DA')
    }
  }

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  };

  return (
    <>
      <div className='flex min-h-full flex-1 flex-col justify-center px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full mt-24 sm:max-w-sm'>
          <h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white'>
            Sign Up to new account
          </h2>
        </div>

        <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
          <form className='space-y-2' onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium leading-6 text-white'
              >
                Name
              </label>
              <div className='mt-2'>
                <input
                  id='name'
                  name='name'
                  type='text'
                  autoComplete='name'
                  required
                  value={credentials.name}
                  placeholder='Enter your Name here'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  onChange={onChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium leading-6 text-white'
              >
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
                  placeholder='Enter your username here'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  onChange={onChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium leading-6 text-white'
              >
                Email
              </label>
              <div className='mt-2'>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={credentials.email}
                  placeholder='Enter your Email here'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  onChange={onChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium leading-6 text-white'
              >
                Password
              </label>
              <div className='mt-2'>
                <input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  required minLength={5}
                  value={credentials.password}
                  placeholder='Enter your password here'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  onChange={onChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='cpassword'
                className='block text-sm font-medium leading-6 text-white'
              >
                Confirm Password
              </label>
              <div className='mt-2'>
                <input
                  id='cpassword'
                  name='cpassword'
                  type='password'
                  autoComplete='current-password'
                  required minLength={5}
                  value={credentials.cpassword}
                  placeholder='Enter your password here'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  onChange={onChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='otp'
                className='block text-sm font-medium leading-6 text-white'
              >
                OTP
              </label>
              <div className='mt-2'>
                <input
                  id='otp'
                  name='otp'
                  type='text'
                  autoComplete='one-time-code'
                  required
                  value={credentials.otp}
                  placeholder='Enter the OTP sent to your email'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  onChange={onChange}
                />
              </div>
            </div>

            <div>
              <button
                type='button'
                className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                onClick={handleGenerateOtp}
                disabled={otpSent}
              >
                {otpSent ? 'OTP Sent' : 'Generate OTP'}
              </button>
            </div>

            <div>
              <button
                type='submit'
                className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
              >
                Sign Up
              </button>
            </div>
          </form>

          <button className='mt-4 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' onClick={logInWithGoogle}>Sign Up with Google 🚀</button>

          <p className='mt-10 text-center text-sm text-gray-500'>
            Already have an account?{' '}
            <Link
              to='/login'
              className='font-semibold leading-6 text-indigo-600 hover:text-indigo-500'
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
};

export default Signup
