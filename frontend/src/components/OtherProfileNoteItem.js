import React, { useState, useRef, useEffect } from 'react'
import NoteModal from './NoteModal'
import InteractionButtons from './InteractionButtons'
const OtherProfileNoteItem = ({ title, tag, description, date, modifiedDate, showAlert }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const options = { day: 'numeric', month: 'short', year: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    const options = { hour: '2-digit', minute: '2-digit', hour12: false }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight)
    }
  }, [description])

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  return (
    <>
      <div className='w-full max-w-sm mx-auto mb-6 bg-[#0a1122] rounded-xl shadow-lg border border-gray-700 text-white flex flex-col'>
        {/* Note Content */}
        <div className='p-4 flex-grow'>
          <h5 className='text-lg font-bold'>{title}</h5>
          <span className='text-[#FDC116] font-medium text-sm'># {tag}</span>
          <div className='relative'>
            <p
              ref={contentRef}
              className='mb-0 mt-2 font-normal text-white whitespace-pre-wrap line-clamp-3 overflow-hidden'
            >
              {description}
            </p>
            {isOverflowing && (
              <button onClick={toggleModal} className='text-sm text-blue-400 hover:underline mt-2'>
                Read More
              </button>
            )}
          </div>
        </div>

        {/* Timestamp - Shows Both Created & Modified Dates */}
        <div className='text-gray-400 text-xs px-4 pb-3'>
          {modifiedDate && (
            <p>Modified: {formatDate(modifiedDate)} at {formatTime(modifiedDate)}</p>
          )}
          <p>Created: {formatDate(date)} at {formatTime(date)}</p>
        </div>

        {/* Interaction Buttons (Optional - Uncomment if needed) */}
        <InteractionButtons className='border-t border-gray-700 mt-auto' title={title} tag={tag} description={description} showAlert={showAlert} />
        {/* <InteractionButtons className='border-t border-gray-700 mt-auto' /> */}
      </div>

      {/* Read More Modal */}
      {isModalOpen && (
        <NoteModal note={{ title, description, date, modifiedDate, tag }} onClose={toggleModal} />
      )}
    </>
  )
}

export default OtherProfileNoteItem
