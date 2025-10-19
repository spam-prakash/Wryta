import React, { useState, useRef, useEffect } from 'react'
import NoteModal from '../NoteModal'
import { Link } from 'react-router-dom'
import InteractionButtons from '../InteractionButtons'
import HiddenDownloadCard from '../utils/HiddenDownloadCard'
import renderWithLinksAndMentions from '../utils/renderWithLinksAndMentions'

const HomeNoteItem = ({ title, tag, description, date, modifiedDate, name, username, image, showAlert, noteId, note }) => {
  const imageAPI = process.env.REACT_APP_IMAGEAPI
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
  const cardRef = useRef(null) // Ref for the card container  const
  const hiddenCardRef = useRef(null) // Hidden copy for download
  const [isNoteModalOpen, setisNoteModalOpen] = useState(false)

  useEffect(() => {
    if (contentRef.current) {
      // ✅ Detect if content is overflowing
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight)
    }
  }, [description])

  const toggleModal = () => {
    setisNoteModalOpen(!isNoteModalOpen)
  }

  return (
    <>
      <div
        ref={cardRef} // Assign the cardRef to the card container
        className='w-full max-w-sm mx-auto mb-6 bg-[#0a1122] rounded-xl shadow-lg border border-gray-700 text-white flex flex-col'
      >
        {/* Header (User Info) */}
        <div className='flex flex-col p-4 pb-1 border-b border-gray-700'>
          <div className='flex items-center mb-1'>
            <Link to={`/u/${username}`}>
              <img
                src={image || `${imageAPI}${encodeURIComponent(username)}`}
                onError={(e) => {
                  e.target.onerror = null // prevent infinite loop
                  e.target.src = `${imageAPI}${encodeURIComponent(username)}`
                }}
                alt={username}
                className='w-10 h-10 rounded-full object-cover'
              />

            </Link>
            <div>
              <Link to={`/u/${username}`} className='ml-3 font-semibold text-gray-200 hover:underline'>
                @{username}
              </Link>
              <div className='text-gray-400 text-xs ml-4'>
                {modifiedDate
                  ? (
                    <p>{formatDate(modifiedDate)} at {formatTime(modifiedDate)}</p>
                    )
                  : (
                    <p>{formatDate(date)} at {formatTime(date)}</p>
                    )}
              </div>
            </div>
          </div>

        </div>

        {/* Note Content */}
        <div className='p-4 flex-grow'>
          <h5 className='text-lg font-bold'>{title}</h5>
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

        {/* Timestamp - Shows Both Created & Modified Dates */}
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

        {/* Like, Download, Copy - Stick to Bottom */}
        <InteractionButtons
          className='border-t border-gray-700 mt-auto'
          title={title}
          tag={tag}
          description={description}
          showAlert={showAlert}
          cardRef={hiddenCardRef}
          noteId={noteId} // Pass the noteId for sharing
          note={note} // Pass the note object for sharing
          // onInteraction={fetchAllNotes}
        />
      </div>

      {/* Read More Modal */}
      {isNoteModalOpen && (
        <NoteModal note={{ title, description, date, modifiedDate, tag }} onClose={toggleModal} isOpen={isNoteModalOpen} />
      )}

      {/* HIDDEN DOWNLOAD NOTE */}
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

export default HomeNoteItem
