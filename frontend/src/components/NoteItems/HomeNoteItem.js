import React, { useState, useRef, useEffect, useContext } from 'react'
import deleteIcon from '../../assets/delete.png'
import editIcon from '../../assets/edit.png'
import noteContext from '../../context/notes/NoteContext'
import NoteModal from '../models/NoteModal'
import { Link } from 'react-router-dom'
import InteractionButtons from '../InteractionButtons'
import HiddenDownloadCard from '../utils/HiddenDownloadCard'
import renderWithLinksAndMentions from '../utils/renderWithLinksAndMentions'
import { LockOpen, Lock } from 'lucide-react'
import { useNoteView } from '../../hooks/useNoteView'
import { trackNoteView } from '../../utils/batchViewTracking'

const HomeNoteItem = ({ title, tag, description, date, modifiedDate, name, username, image, showAlert, noteId, note, updateNote, userIdThroughProps }) => {
  const context = useContext(noteContext)
  const { deleteNote, updateVisibility } = context
  // console.log(note)

  // GET USER ID FROM LOACLSTORAGE TOKEN
  const token = localStorage.getItem('token')
  let userId = null

  if (token) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const decodedPayload = JSON.parse(window.atob(base64))
      userId = decodedPayload.user?.id || decodedPayload.id
    } catch (error) {
      console.error('Error decoding token:', error)
    }
  }

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

  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef(null)
  const cardRef = useRef(null) // Ref for the card container  const
  const hiddenCardRef = useRef(null) // Hidden copy for download
  const [isNoteModalOpen, setisNoteModalOpen] = useState(false)
  
  // Track note view when it becomes visible (700ms + repeatable)
  const isOwner = userIdThroughProps === userId
  const viewRef = useNoteView(note._id, trackNoteView, isOwner)

  useEffect(() => {
    if (contentRef.current) {
      // ✅ Detect if content is overflowing
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight)
    }
  }, [description])

  const toggleModal = () => {
    setisNoteModalOpen(!isNoteModalOpen)
  }

  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false)
  const modalRef = useRef(null)
  const toggleVisibilityModal = () => setIsVisibilityModalOpen(!isVisibilityModalOpen)

  const handleVisibilityChange = (newVisibility) => {
    updateVisibility(note._id, newVisibility)
    setIsVisibilityModalOpen(false)
  }

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight)
    }
  }, [note.description])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsVisibilityModalOpen(false)
      }
    }

    if (isVisibilityModalOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisibilityModalOpen])

  return (
    <>
      <div
        ref={(el) => {
          cardRef.current = el
          if (viewRef) viewRef.current = el
        }}
        className='w-full max-w-sm mx-auto mb-6 bg-[#0a1122] rounded-xl shadow-lg border border-gray-700 text-white flex flex-col'
      >
        {/* Header (User Info) */}
        <div className='flex flex-row justify-between p-4 pb-1 border-b border-gray-700'>
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
          {userIdThroughProps === userId && (

            <div className='flex gap-3'>
              <img
                onClick={() => {
                  deleteNote(note._id)
                  showAlert('Note deleted!', '#D4EDDA')
                }}
                src={deleteIcon}
                className='size-6 cursor-pointer'
                alt='Delete'
              />
              <img
                onClick={() => {
                  updateNote(note)
                }}
                src={editIcon}
                className='size-6 cursor-pointer'
                alt='Edit'
              />
            </div>
          )}

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
          {/* {note.modifiedDate && (
            <p className='py-1'>
              Modified: {formatDate(note.modifiedDate)} at {formatTime(note.modifiedDate)}
            </p>
          )} */}
          <div className='flex items-center justify-between'>

            <p className='text-xs mt-2 text-slate-500'>
              Published: {formatDate(note.publicDate || note.date)} at {formatTime(note.publicDate || note.date)}
            </p>

            {userIdThroughProps === userId && (
              <div className='mt-2 flex items-center justify-end'>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleVisibilityModal()
                  }}
                  className='p-2 rounded-full hover:bg-gray-800 transition'
                  title={note.isPublic ? 'Make Private' : 'Make Public'}
                >
                  {note.isPublic
                    ? <LockOpen size={22} color='#00ff40' />
                    : <Lock size={22} color='red' />}
                </button>
              </div>
            )}
          </div>

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
          ownerName={note.user.username}
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

      {isVisibilityModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50'>
          <div ref={modalRef} className='bg-[#111827] p-6 rounded-xl text-center'>
            <h3 className='text-lg font-semibold mb-4 text-gray-100'>Change Note Visibility</h3>
            <p className='text-sm text-gray-400 mb-5'>
              Current: <strong>{note.isPublic ? 'Public' : 'Private'}</strong>
            </p>
            <div className='flex justify-center gap-4'>
              <button
                onClick={() => handleVisibilityChange(true)}
                className='px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700'
              >
                {note.isPublic ? 'Keep Public' : 'Make Public'}
              </button>
              <button
                onClick={() => handleVisibilityChange(false)}
                className='px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700'
              >
                {note.isPublic ? 'Make Private' : 'Keep Private'}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

export default HomeNoteItem
