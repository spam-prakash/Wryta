import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Profile = (props) => {
  const { name, username, email, image } = props.user || {}
  // console.log(image)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen px-4 md:px-6 text-white">
    <div className="bg-[#0A1122] bg-opacity-80 rounded-lg shadow-lg py-6 px-6 sm:px-10 w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
  
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-white">Profile Details</h3>
        <p className="mt-1 text-sm md:text-base text-gray-400">Details and information about you.</p>
        <hr className="mt-4 border-gray-600" />
      </div>
  
      {/* Profile Section */}
      <div className="lg:flex lg:items-center space-x-6">
        {image && (
          <div className="flex-shrink-0 flex items-center justify-center">
            <a href={image} target='_blank'>
              <img className="size-40 lg:size-40 md:size-40 rounded-full cursor-pointer" src={image} alt="Profile" />
            </a>
          </div>
        )}
  
        {/* Details Section */}
        <div className="flex-1 space-y-4 w-full flex flex-col justify-center h-full">
          <div className='grid grid-cols-2 gap-4'>
            <dt className='text-sm md:text-base font-medium'>Name</dt>
            <dd className='text-sm md:text-base'>{name || 'N/A'}</dd>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <dt className='text-sm md:text-base font-medium'>Username</dt>
            <dd className='text-sm md:text-base'>{username || 'N/A'}</dd>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <dt className='text-sm md:text-base font-medium'>Email</dt>
            <dd className='text-sm md:text-base'>{email || 'N/A'}</dd>
          </div>
        </div>
      </div>
  
    </div>
  </div>
  

  )
};

export default Profile
