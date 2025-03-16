import React, { useEffect, useRef } from 'react'

const NoteModal = ({ note, onClose }) => {
  const modalRef = useRef(null)

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: false }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose()
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    // document.body.style.overflow = 'hidden' // Disable background scrolling
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      // document.body.style.overflow = 'auto' // Enable background scrolling
    }
  }, [])

  return (
    <div className='fixed inset-0 bg-opacity-50 flex justify-center items-center my-20 mx-4 md:my-0 md:mt-16 md:mx-0'>
      <div ref={modalRef} className='bg-[#0a1122] p-6 rounded-lg shadow-2xl w-full max-w-lg max-h-full overflow-y-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h5 className='text-2xl font-bold text-white'>{note.title}</h5>
          <button onClick={onClose} className='text-white text-xl'>&times;</button>
        </div>
        <span className='text-white cursor-text bg-transparent font-medium rounded-lg text-base mb-0'>
          <span className='text-[#FDC116]'># </span>{note.tag}
        </span>
        <p className='mb-4 font-normal text-white whitespace-pre-wrap'>{note.description}</p>
        <div className='mt-4'>
          {note.modifiedDate && (
            <p className='text-xs mt-2 text-slate-500'>Modified: {formatDate(note.modifiedDate)} at {formatTime(note.modifiedDate)}</p>
          )}
          <p className='text-xs mt-2 text-slate-500'>Created: {formatDate(note.date)} at {formatTime(note.date)}</p>
        </div>
      </div>
    </div>
  )
}

export default NoteModal