import React, { useContext, useState, useEffect, useRef } from 'react'
import deleteIcon from '../../assets/delete.png'
import editIcon from '../../assets/edit.png'
import noteContext from '../../context/notes/NoteContext'
import NoteModal from '../models/NoteModal'
import { Lock, LockOpen, X, Copy, Download, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import InteractionButtons from '../InteractionButtons'
import HiddenDownloadCard from '../utils/HiddenDownloadCard'
import renderWithLinksAndMentions from '../utils/renderWithLinksAndMentions'

const OwnNoteItem = (props) => {
  const { username } = props
  // console.log(username)
  const imageAPI = process.env.REACT_APP_IMAGEAPI
  const image = props.image || `${imageAPI}${encodeURIComponent(username)}`
  const { note, updateNote, showAlert } = props
  // console.log(note)
  const context = useContext(noteContext)
  const { deleteNote, updateVisibility } = context

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

  const [isNoteModelOpen, setIsNoteModelOpen] = useState(false)
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef(null)
  const modalRef = useRef(null)
  const hiddenCardRef = useRef(null)

  const toggleModal = () => setIsNoteModelOpen(!isNoteModelOpen)
  const toggleVisibilityModal = () => setIsVisibilityModalOpen(!isVisibilityModalOpen)


  // ✅ Improved download with guaranteed profile image rendering
  const handleImageDownload = async () => {
    const card = hiddenCardRef.current
    if (!card) return

    const img = card.querySelector('img')

    // Convert external image to Base64 before capturing (fixes CORS & timing)
    if (img && !img.src.startsWith('data:')) {
      try {
        const response = await fetch(img.src, { mode: 'cors' })
        const blob = await response.blob()
        const reader = new FileReader()
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        })
        const base64Data = await base64Promise
        img.src = base64Data
      } catch (err) {
        console.warn('Could not convert image to Base64:', err)
      }
    }

    html2canvas(card, { useCORS: true, allowTaint: true, scale: 2 })
      .then((canvas) => {
        const link = document.createElement('a')
        link.download = `${note.title || 'note'}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        showAlert('Note downloaded as image!', '#D4EDDA')
      })
      .catch((err) => {
        console.error('Image download error:', err)
        showAlert('Failed to download note as image.', '#F8D7DA')
      })
  }

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
      <div className='text-white w-full max-w-sm mx-auto mb-6 bg-[#0a1122] rounded-xl shadow-lg border border-gray-700 flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-gray-700'>
          <h5 className='text-lg font-bold text-white truncate'>{note.title}</h5>
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
        </div>

        {/* Content */}
        <div className='p-4 flex-grow'>
          {note.tag.length > 2 && <span className='text-[#FDC116] font-medium text-sm'># {note.tag}</span>}
          <div className='relative'>
            <p ref={contentRef} className='mt-2 font-normal text-white whitespace-pre-wrap line-clamp-3 overflow-hidden'>
              {renderWithLinksAndMentions(note.description)}
            </p>
            {isOverflowing && (
              <button onClick={toggleModal} className='text-sm text-blue-400 hover:underline mt-2'>
                Read More
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='px-2 pb-3 border-t border-gray-700 flex flex-col'>
          <div className='text-gray-400 text-xs border-b border-gray-700 pb-2 flex justify-between items-center pt-2'>
            <div>
              {note.modifiedDate && (
                <p>
                  Updated: {formatDate(note.modifiedDate)} at {formatTime(note.modifiedDate)}
                </p>
              )}
              {note.publicDate && (
                <p>
                  Published: {formatDate(note.publicDate)} at {formatTime(note.publicDate)}
                </p>
              )}
              <p>
                Created: {formatDate(note.date)} at {formatTime(note.date)}
              </p>
            </div>
            <button onClick={toggleVisibilityModal} className='text-xs p-2 mr-3 rounded-full transition '>
              {note.isPublic ? <LockOpen size={24} color='#00ff40' /> : <Lock size={24} color='red' />}
            </button>
          </div>

          <InteractionButtons
            className='border-t border-gray-700 mt-auto'
            title={note.title}
            tag={note.tag}
            description={note.description}
            showAlert={showAlert}
            cardRef={hiddenCardRef}
            noteId={note._id}
            note={note}
            onDownload={handleImageDownload} // ✅ ensures profile image included
            ownerName={username}
          />
        </div>
      </div>

      {isNoteModelOpen && <NoteModal note={note} onClose={toggleModal} isOpen={isNoteModelOpen} />}

      {isVisibilityModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50'>
          <div ref={modalRef} className='bg-[#111827] p-6 rounded-xl text-center'>
            <h3 className='text-lg font-semibold mb-4'>Change Note Visibility</h3>
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

export default OwnNoteItem
