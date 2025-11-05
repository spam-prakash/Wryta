import React from 'react'

const EditProfileModel = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = React.useState({
    username: initialData.username || '',
    name: initialData.name || '',
    bio: initialData.bio || ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      username: formData.username || initialData.username,
      name: formData.name || initialData.name,
      bio: formData.bio
    })
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4'>
      <div className='bg-[#1E293B] rounded-lg p-6 w-full max-w-md'>
        <h2 className='text-xl font-bold mb-4 text-white'>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label htmlFor='username' className='block text-sm font-medium text-gray-300'>
              Username
            </label>
            <input
              id='username'
              name='username'
              type='text'
              value={formData.username}
              onChange={handleChange}
              className='mt-1 block w-full rounded-md border-gray-600 bg-[#374151] text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2'
              placeholder={initialData.username}
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='name' className='block text-sm font-medium text-gray-300'>
              Name
            </label>
            <input
              id='name'
              name='name'
              type='text'
              value={formData.name}
              onChange={handleChange}
              className='mt-1 block w-full rounded-md border-gray-600 bg-[#374151] text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2'
              placeholder={initialData.name}
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='name' className='block text-sm font-medium text-gray-300'>
              Bio
            </label>
            <textarea
              id='bio'
              name='bio'
              value={formData.bio}
              onChange={handleChange}
              className='mt-1 block w-full rounded-md border-gray-600 bg-[#374151] text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2'
              placeholder={initialData.bio}
              rows={4}
            />
          </div>
          <div className='flex justify-end space-x-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModel
