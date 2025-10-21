import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImageUp, Loader2, CheckCircle } from 'lucide-react'

const UploadImage = ({ user, setUser }) => {
  const [image, setImage] = useState(null)
  const navigate = useNavigate()
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const [error, setError] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setUploadedUrl(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!image) {
      setError('Please select an image first.')
      return
    }

    const formData = new FormData()
    formData.append('image', image)

    try {
      setUploading(true)
      // Do not set Content-Type header when sending FormData; the browser
      // will set the correct multipart boundary.
      const headers = {}
      try {
        if (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem) {
          const token = window.localStorage.getItem('token')
          if (token) headers['auth-token'] = token
        }
      } catch (e) {
        // ignore localStorage errors (e.g., in restricted contexts)
      }

      const res = await fetch(`${process.env.REACT_APP_HOSTLINK}/api/upload/image`, {
        method: 'POST',
        body: formData,
        headers
      })
      const data = await res.json()
      if (data.success) {
        setUploadedUrl(data.imageUrl)
        // Update the app-level user object with the new image so Navbar updates
        if (setUser && data.userImage) {
          try {
            setUser(prev => {
              const updated = { ...(prev || {}), image: data.userImage }
              try {
                if (typeof window !== 'undefined' && window.localStorage && window.localStorage.setItem) {
                  window.localStorage.setItem('user', JSON.stringify(updated))
                }
              } catch (err) {
                // ignore localStorage write errors
              }
              return updated
            })
          } catch (e) {
            // ignore setUser errors
          }
        }
        // Navigate to the user's profile on successful upload
        try {
          if (user && user.username) {
            navigate(`/u/${user.username}`)
          }
        } catch (e) {
          // ignore navigation errors
        }
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (err) {
      // Surface server error message when available
      const msg = err && err.message ? err.message : 'Something went wrong while uploading.'
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-[80vh] px-4'>
      <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8 w-full max-w-md border border-gray-200 dark:border-gray-800 transition-all duration-300'>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-4'>
          Upload Image
        </h2>

        <div className='w-full flex flex-col items-center gap-4'>
          <label className='cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200'>
            {preview
              ? (
                <img
                  src={preview}
                  alt='Preview'
                  className='rounded-xl w-40 h-40 object-cover shadow-sm'
                />
                )
              : (
                <div className='flex flex-col items-center text-gray-500 dark:text-gray-400'>
                  <ImageUp size={42} className='mb-2' />
                  <p className='text-sm font-medium'>Click to upload an image</p>
                </div>
                )}
            <input
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleImageChange}
            />
          </label>

          {error && (
            <p className='text-sm text-red-500 font-medium mt-2'>{error}</p>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className='mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {uploading
              ? (
                <>
                  <Loader2 className='animate-spin w-5 h-5' /> Uploading...
                </>
                )
              : (
                  'Upload'
                )}
          </button>

          {uploadedUrl && (
            <div className='flex flex-col items-center mt-4'>
              <CheckCircle className='text-green-500 w-8 h-8 mb-2' />
              <p className='text-sm text-gray-700 dark:text-gray-300'>
                Image uploaded successfully!
              </p>
              <a
                href={uploadedUrl}
                target='_blank'
                rel='noreferrer'
                className='text-blue-600 hover:underline text-sm mt-1 break-all text-center'
              >
                {uploadedUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadImage
