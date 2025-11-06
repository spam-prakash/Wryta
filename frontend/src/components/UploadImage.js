import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Loader2, CheckCircle, X, ImageUp } from 'lucide-react'

const UploadImage = ({ user, setUser }) => {
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const [error, setError] = useState(null)

  // Convert cropped area into a blob
  const getCroppedImg = useCallback((imageSrc, cropPixels) => {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.src = imageSrc
      image.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = cropPixels.width
        canvas.height = cropPixels.height

        ctx.drawImage(
          image,
          cropPixels.x,
          cropPixels.y,
          cropPixels.width,
          cropPixels.height,
          0,
          0,
          cropPixels.width,
          cropPixels.height
        )

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'))
            return
          }
          blob.name = 'cropped.jpeg'
          resolve(blob)
        }, 'image/jpeg')
      }
      image.onerror = () => reject(new Error('Failed to load image'))
    })
  }, [])

  const onCropComplete = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setImageSrc(reader.result)
      reader.readAsDataURL(file)
      setError(null)
      setUploadedUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setError('Please select and crop an image first.')
      return
    }

    try {
      setUploading(true)
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)

      const formData = new FormData()
      formData.append('image', croppedBlob, 'profile.jpeg')

      const headers = {}
      const token = localStorage.getItem('token')
      if (token) headers['auth-token'] = token

      const res = await fetch(`${process.env.REACT_APP_HOSTLINK}/api/upload/image`, {
        method: 'POST',
        body: formData,
        headers
      })

      const data = await res.json()
      if (data.success) {
        setUploadedUrl(data.imageUrl)

        if (setUser && data.userImage) {
          setUser((prev) => {
            const updated = { ...(prev || {}), image: data.userImage }
            localStorage.setItem('user', JSON.stringify(updated))
            return updated
          })
        }
      } else {
        setError(data.error || 'Upload failed.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-[85vh] px-4'>
      <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8 w-full max-w-md border border-gray-200 dark:border-gray-800 transition-all duration-300'>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-4'>
          Upload Profile Picture
        </h2>

        {!imageSrc
          ? (
            <label className='cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200'>
    <ImageUp size={42} className='mb-2 text-gray-500 dark:text-gray-400' />
    <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              Click to upload an image
            </p>
    <input
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleFileChange}
            />
  </label>
            )
          : (
            <div className='relative flex flex-col items-center'>
    <div className='relative w-64 h-64 bg-black rounded-xl overflow-hidden'>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape='round'
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

    <div className='w-48 mt-3'>
              <input
                type='range'
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
                className='w-full accent-blue-500'
              />
            </div>

    <div className='flex justify-center mt-4 gap-3'>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className='bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {uploading ? <Loader2 className='animate-spin w-5 h-5' /> : 'Upload'}
              </button>
              <button
                onClick={() => {
                  setImageSrc(null)
                  setZoom(1)
                }}
                className='bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200'
              >
                <X className='w-4 h-4' /> Cancel
              </button>
            </div>
  </div>
            )}

        {error && <p className='text-sm text-red-500 font-medium mt-3'>{error}</p>}

        {uploadedUrl && (
          <div className='flex flex-col items-center mt-5'>
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
  )
}

export default UploadImage
