import React, { useState, useRef, useEffect } from 'react'
import NoteModal from '../NoteModal'
import InteractionButtons from '../InteractionButtons'
import renderWithLinksAndMentions from '../utils/renderWithLinksAndMentions'
import HiddenDownloadCard from '../utils/HiddenDownloadCard'

const OtherProfileNoteItem = ({
  title,
  tag,
  description,
  date,
  modifiedDate,
  username,
  image,
  noteId,
  showAlert,
  note
}) => {
  const imageAPI = process.env.REACT_APP_IMAGEAPI
  if (!image) {
    image = `${imageAPI}${encodeURIComponent(username)}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const options = { day: 'numeric', month: 'short', year: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // console.log(note)

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    const options = { hour: '2-digit', minute: '2-digit', hour12: false }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  const [isNoteModelOpen, setIsNoteModelOpen] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef(null)
  const cardRef = useRef(null) // Visible card
  const hiddenCardRef = useRef(null) // Hidden copy for download
  // console.log(note)
  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight)
    }
  }, [description])

  const toggleModal = () => {
    setIsNoteModelOpen(!isNoteModelOpen)
  }
  // console.log(modifiedDate)
  // console.log(username)

  return (
    <>
      {/* Visible Note Card */}
      <div
        className='w-full max-w-sm mx-auto mb-6 bg-[#0a1122] rounded-xl shadow-lg border border-gray-700 text-white flex flex-col'
        ref={cardRef}
      >
        {/* Header */}
        {/* <div className='flex items-center p-4 border-b border-gray-700'>
          <img
            src={image || `imageAPI${username}`}
            crossOrigin='anonymous'
            alt={username}
            className='w-12 h-12 rounded-full border border-gray-600'
          />
          <div className='ml-3'>
            <p className='font-semibold text-gray-200'>@{username}</p>
            <p className='text-gray-400 text-xs'>
              {modifiedDate
                ? `Modified: ${formatDate(modifiedDate)} at ${formatTime(modifiedDate)}`
                : `Created: ${formatDate(date)} at ${formatTime(date)}`}
            </p>
          </div>
        </div> */}

        {/* Content */}
        <div className='p-4 flex-grow'>
          <h5 className='text-lg font-bold uppercase'>{title}</h5>
          {tag.length > 2 && <span className='text-[#FDC116] font-medium text-sm'># {tag}</span>}
          <div className='relative'>
            <p
              ref={contentRef}
              className='mb-0 mt-2 font-normal text-white whitespace-pre-wrap line-clamp-3 overflow-hidden'
            >
              {renderWithLinksAndMentions(description)}
            </p>
            {isOverflowing && (
              <button onClick={toggleModal} className='text-sm text-blue-400 hover:underline mt-2'>
                Read More
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='text-gray-400 text-xs px-4 pb-3'>
          {note.modifiedDate && (
            <p className='py-1'>
              Modified: {formatDate(note.modifiedDate)} at {formatTime(note.modifiedDate)}
            </p>
          )}
          <p className='py-1'>
            Created: {formatDate(note.date)} at {formatTime(note.date)}
          </p>
        </div>

        {/* Buttons */}
        <InteractionButtons
          className='border-t border-gray-700 mt-auto'
          title={title}
          tag={tag}
          description={description}
          showAlert={showAlert}
          cardRef={hiddenCardRef}
          noteId={noteId}
          note={note}
          ownerName={username}
        />
      </div>

      {/* Read More Modal */}
      {isNoteModelOpen && (
        <NoteModal note={{ title, description, date, modifiedDate, tag }} onClose={toggleModal} isOpen={isNoteModelOpen} />
      )}

      {/* Offscreen Hidden Card for Download */}
      <HiddenDownloadCard
        ref={hiddenCardRef}
        note={note}
        username={username}
        image={image}
        formatDate={formatDate}
        formatTime={formatTime}
      />
    </>
  )
}

export default OtherProfileNoteItem
