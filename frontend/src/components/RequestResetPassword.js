import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'

import axios from 'axios'
const RequestResetPassword = (props) => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const hostLink = process.env.REACT_APP_HOSTLINK

  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch(`${hostLink}/api/auth/request-reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })
    const json = await response.json()
    if (json.success) {
      setMessage('Password reset link sent to your email')
      props.showAlert('Password reset link sent to your email', '#D4EDDA')
    } else {
      setMessage(json.error || 'Failed to send password reset link')
      props.showAlert(json.error || 'Failed to send password reset link', '#F8D7DA')
    }
  }

  return (
    <div className='flex min-h-full flex-1 flex-col justify-center px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full mt-24 sm:max-w-sm'>
        <h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white'>
          Request Password Reset
        </h2>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
        <form className='space-y-2' onSubmit={handleSubmit}>
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
                value={email}
                placeholder='Enter your Email here'
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type='submit'
              className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
            >
              Request Reset Link
            </button>
          </div>
        </form>

        {message && <p className='mt-4 text-center text-sm text-gray-500'>{message}</p>}
      </div>
    </div>
  )
}

export default RequestResetPassword
