import React, { forwardRef } from 'react'
import InteractionButtons from '../InteractionButtons'

const HiddenDownloadCard = forwardRef(({ note, username, image, formatDate, formatTime }, ref) => {
  const imageAPI = process.env.REACT_APP_IMAGEAPI
  if (!note) return null

  const { title, tag, description, date, modifiedDate } = note

  const getAvatarURL = (username) => {
    const base = process.env.REACT_APP_IMAGEAPI
    // Request PNG output instead of SVG (supported by DiceBear)
    return `${base}${encodeURIComponent(username)}&format=png`
  }

  if (!image) {
    image = getAvatarURL(username)
  }

  return (
    <div
      style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
    >
      <div
        ref={ref}
        className='w-full mx-auto mb-6 bg-[#0a1122] rounded-xl shadow-lg border border-gray-700 text-white flex flex-col overflow-hidden'
      >
        {/* Header (User Info) */}
        <div className='flex items-center gap-3 p-4 border-b border-gray-700'>
          <div className='relative w-12 h-12 rounded-full border border-gray-600 bg-gray-800 overflow-hidden flex items-center justify-center flex-shrink-0'>
            <img
              src={image || `${imageAPI}${encodeURIComponent(username)}`}
              onError={(e) => {
                e.target.onerror = null // prevent infinite loop
                e.target.src = `${imageAPI}${encodeURIComponent(username)}`
              }}
              alt={username}
              crossOrigin='anonymous'
              referrerPolicy='no-referrer'
              className='absolute inset-0 w-full h-full object-cover rounded-full'
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>

          <div className='flex flex-col justify-center'>
            <p className='font-semibold text-gray-200 leading-tight'>@{username}</p>
            <p className='text-gray-400 text-xs leading-tight mt-1'>
              {modifiedDate
                ? `Modified: ${formatDate(modifiedDate)} at ${formatTime(modifiedDate)}`
                : `Created: ${formatDate(date)} at ${formatTime(date)}`}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className='p-4 flex-grow'>
          <h5 className='text-lg font-bold uppercase leading-tight'>{title}</h5>
          {tag?.length > 2 && <span className='text-[#FDC116] font-medium text-sm leading-tight'># {tag}</span>}
          <p className='mb-0 mt-2 font-normal text-white whitespace-pre-wrap leading-relaxed'>{description}</p>
        </div>

        {/* Interaction buttons - wrapped in a container with explicit styling */}
        <div className='border-t border-gray-700'>
          <InteractionButtons
            title={title}
            tag={tag}
            description={description}
            noteId={note._id}
            note={note}
          />
        </div>
      </div>
    </div>
  )
})

export default HiddenDownloadCard
