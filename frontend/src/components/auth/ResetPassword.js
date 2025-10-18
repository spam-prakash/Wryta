import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

const ResetPassword = (props) => {
  const [password, setPassword] = useState('')
  const [cpassword, setCPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const hostLink = process.env.REACT_APP_HOSTLINK

  const handleSubmit = async (e) => {
    e.preventDefault()
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const email = params.get('email')

    if (password !== cpassword) {
      setMessage('Passwords do not match')
      props.showAlert('Passwords do not match', '#F8D7DA')
      return
    }

    const response = await fetch(`${hostLink}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, token, password })
    })
    const json = await response.json()
    if (json.success) {
      setMessage('Password reset successfully')
      props.showAlert('Password reset successfully', '#D4EDDA')
      navigate('/login')
    } else {
      setMessage(json.error || 'Failed to reset password')
      props.showAlert(json.error || 'Failed to reset password', '#F8D7DA')
    }
  }

  return (
    <div className='flex min-h-full flex-1 flex-col justify-center px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full mt-24 sm:max-w-sm'>
        <h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white'>
          Reset Password
        </h2>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
        <form className='space-y-2' onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium leading-6 text-white'
            >
              New Password
            </label>
            <div className='mt-2'>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='new-password'
                required
                minLength={5}
                value={password}
                placeholder='Enter your new password here'
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='cpassword'
              className='block text-sm font-medium leading-6 text-white'
            >
              Confirm New Password
            </label>
            <div className='mt-2'>
              <input
                id='cpassword'
                name='cpassword'
                type='password'
                autoComplete='new-password'
                required
                minLength={5}
                value={cpassword}
                placeholder='Confirm your new password here'
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                onChange={(e) => setCPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type='submit'
              className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
            >
              Reset Password
            </button>
          </div>
        </form>

        {message && <p className='mt-4 text-center text-sm text-gray-500'>{message}</p>}
      </div>
    </div>
  )
}

export default ResetPassword
