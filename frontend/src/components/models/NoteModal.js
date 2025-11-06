import React, { useEffect, useRef } from 'react'
import renderWithLinksAndMentions from '../utils/renderWithLinksAndMentions'

const NoteModal = ({ note, onClose, isOpen }) => {
  const modalRef = useRef(null)
  // console.log(note)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto'
    return () => (document.body.style.overflow = 'auto')
  }, [isOpen])

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

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      onClose()
    }
  })
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    // document.body.style.overflow = 'hidden' // Disable background scrolling
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      // document.body.style.overflow = 'auto' // Enable background scrolling
    }
  }, [])

  return (
    <div className='fixed inset-x-0 top-16 bottom-0 z-50 bg-opacity-50 backdrop-blur-sm flex justify-center items-center mx-4 '>
      <div ref={modalRef} className='bg-[#0a1122] p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-full overflow-y-auto relative [&::-webkit-scrollbar]:hidden scrollbar-thin scrollbar-transparent'>
        <div className='flex justify-between items-center mb-4'>
          <h5 className='text-2xl font-bold text-white'>{note.title}</h5>
          <button onClick={onClose} className='text-white text-xl'>&times;</button>
        </div>
        <span className='text-white cursor-text bg-transparent font-medium rounded-lg text-base mb-0'>
          <span className='text-[#FDC116]'># </span>{note.tag}
        </span>
        <p className='mb-4 font-normal text-white whitespace-pre-wrap'>{renderWithLinksAndMentions(note.description)}</p>
        <div className='mt-4'>
          <p className='text-xs mt-2 text-slate-500'>
            {(() => {
              const dates = [note.publicDate, note.modifiedDate, note.date]
                .filter(Boolean)
                .map((d) => new Date(d))
                .filter((d) => !isNaN(d))

              if (!dates.length) return 'Published: N/A'

              const latest = new Date(Math.max(...dates.map((d) => d.getTime())))
              return <>Published: {formatDate(latest)} at {formatTime(latest)}</>
            })()}
          </p>

        </div>
      </div>
    </div>
  )
}

export default NoteModal
