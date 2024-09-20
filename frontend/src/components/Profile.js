import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Profile = (props) => {
  const { name, username, email } = props.user || {}
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  return (
    <div className='flex items-center justify-center min-h-screen px-4 md:px-6 text-white'>
      <div className='container mx-auto bg-[#0A1122] bg-opacity-80 rounded-lg shadow-lg py-6 px-4 md:px-8 max-w-xl'>
        {/* Header */}
        <div className='text-center mb-6'>
          <h3 className='text-2xl md:text-3xl font-bold text-white'>
            Profile Details
          </h3>
          <p className='mt-1 text-sm md:text-base text-gray-400'>
            Details and information about you.
          </p>
          <hr className='mt-4 border-gray-600' />
        </div>

        {/* Profile Information */}
        <div className='space-y-6'>
          <div className='px-4 sm:px-6 grid grid-cols-2 gap-2'>
            <dt className='text-sm md:text-base font-medium'>Name</dt>
            <dd className='text-sm md:text-base'>{name || 'N/A'}</dd>
          </div>
          <div className='px-4 sm:px-6 grid grid-cols-2 gap-2'>
            <dt className='text-sm md:text-base font-medium'>Username</dt>
            <dd className='text-sm md:text-base'>{username || 'N/A'}</dd>
          </div>
          <div className='px-4 sm:px-6 grid grid-cols-2 gap-2'>
            <dt className='text-sm md:text-base font-medium'>Email</dt>
            <dd className='text-sm md:text-base'>{email || 'N/A'}</dd>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Profile
