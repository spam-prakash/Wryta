import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from './cropImage'

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const handleCropComplete = useCallback(async (_, croppedAreaPixels) => {
    const croppedImage = await getCroppedImg(image, croppedAreaPixels)
    onCropComplete(croppedImage)
  }, [image, onCropComplete])

  return (
    <div className='fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50'>
      <div className='relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-gray-800 rounded-lg overflow-hidden'>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1} // ✅ perfect square
          cropShape='round' // circular preview
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>

      <div className='flex gap-4 mt-4'>
        <button
          onClick={onCancel}
          className='px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600'
        >
          Cancel
        </button>
        <button
          onClick={() => handleCropComplete()}
          className='px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700'
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default ImageCropper
