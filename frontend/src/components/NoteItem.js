import React, { useContext, useState, useEffect, useRef } from 'react'
import deleteIcon from '../assets/delete.png'
import editIcon from '../assets/edit.png'
import noteContext from '../context/notes/NoteContext'
import NoteModal from './NoteModal'
import { Lock, LockOpen, X, Copy, Download, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import InteractionButtons from './InteractionButtons'

const NoteItem = (props) => {
  const { image, username } = props
  const { note, updateNote, showAlert } = props
  // console.log('note id', note._id)
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

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef(null)
  const modalRef = useRef(null)
  const hiddenCardRef = useRef(null)

  const toggleModal = () => setIsModalOpen(!isModalOpen)
  const toggleVisibilityModal = () => setIsVisibilityModalOpen(!isVisibilityModalOpen)

  const copyToClipboard = () => {
    const textToCopy = `Title: ${note.title}\nTag: ${note.tag}\n\nDescription:\n${note.description}`
    navigator.clipboard.writeText(textToCopy)
      .then(() => showAlert('Note successfully copied!', '#D4EDDA'))
      .catch(() => showAlert('Failed to copy note.', '#F8D7DA'))
  }

  const handleImageDownload = () => {
    const card = hiddenCardRef.current
    if (!card) return

    const img = card.querySelector('img')

    if (img && !img.complete) {
      img.onload = () => captureCard()
      img.onerror = () => {
        console.error('Image failed to load, downloading without avatar')
        captureCard()
      }
    } else {
      captureCard()
    }
  }

  const captureCard = () => {
    html2canvas(hiddenCardRef.current, { useCORS: true, allowTaint: true })
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

  const shareNote = async () => {
    const shareUrl = `${window.location.origin}/note/${note._id}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: note.title || 'Shared Note',
          text: `Check out this note: ${note.title}`,
          url: shareUrl
        })
        showAlert('Note shared successfully!', '#D4EDDA')
      } else {
        await navigator.clipboard.writeText(shareUrl)
        showAlert('Note link copied to clipboard!', '#D4EDDA')
      }
    } catch (error) {
      console.error('Error sharing note:', error)
      showAlert('Failed to share note. Please try again.', '#F8D7DA')
    }
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

  // console.log('NoteItem:', note)

  return (
    <>
      <div className='text-white w-full max-w-sm mx-auto mb-6 bg-[#0a1122] rounded-xl shadow-lg border border-gray-700 flex flex-col'>
        {/* Header: Title & Actions */}
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

        {/* Note Content */}
        <div className='p-4 flex-grow'>
          {note.tag.length > 2 && <span className='text-[#FDC116] font-medium text-sm'># {note.tag}</span>}
          <div className='relative'>
            <p ref={contentRef} className='mt-2 font-normal text-white whitespace-pre-wrap line-clamp-3 overflow-hidden'>
              {note.description}
            </p>
            {isOverflowing && (
              <button onClick={toggleModal} className='text-sm text-blue-400 hover:underline mt-2'>
                Read More
              </button>
            )}
          </div>
        </div>

        {/* Footer: Timestamps & Actions */}
        <div className='px-2 pb-3 border-t border-gray-700 flex flex-col'>
          <div className='text-gray-400 text-xs border-b border-gray-700 pb-2 flex justify-between items-center pt-2'>
            <div>
              {note.modifiedDate && (
                <p>
                  Modified: {formatDate(note.modifiedDate)} at {formatTime(note.modifiedDate)}
                </p>
              )}
              <p>
                Created: {formatDate(note.date)} at {formatTime(note.date)}
              </p>
            </div>
            <button
              onClick={toggleVisibilityModal}
              className='text-xs p-2 mr-3 rounded-full transition '
            >
              {note.isPublic ? <LockOpen size={24} color='#00ff40' /> : <Lock size={24} color='red' />}
            </button>
          </div>

          {/* <div className='flex gap-3 left-icons '>
            <button onClick={copyToClipboard} className='flex items-center space-x-2'>
              <Copy />
            </button>
            <button onClick={handleImageDownload} className='flex items-center space-x-2'>
              <Download />
            </button>
            <button onClick={shareNote} className='flex items-center space-x-2'>
              <Share2 />
            </button>

          </div> */}

          {/* Like, Download, Copy - Stick to Bottom */}
          <InteractionButtons
            className='border-t border-gray-700 mt-auto'
            title={note.title}
            tag={note.tag}
            description={note.description}
            showAlert={showAlert}
            cardRef={hiddenCardRef}
            noteId={note._id}
            note={note} // Pass the note object for sharing
          />
        </div>
      </div>

      {/* Read More Modal */}
      {isModalOpen && <NoteModal note={note} onClose={toggleModal} />}

      {/* Visibility Modal */}
      {isVisibilityModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4'>
          <div
            ref={modalRef}
            className='bg-[#121a2f] p-6 rounded-lg shadow-lg w-full max-w-sm border border-gray-600'
          >
            <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
              <h3 className='text-white text-lg font-semibold'>Change Visibility</h3>
              <button onClick={toggleVisibilityModal} className='text-gray-400 hover:text-white'>
                <X size={20} />
              </button>
            </div>

            <div className='mt-4 flex flex-col gap-3'>
              <button
                className='w-full bg-green-600 px-4 py-2 rounded-lg text-white text-sm hover:bg-green-700 transition'
                onClick={() => handleVisibilityChange(true)}
              >
                Make Public
              </button>
              <button
                className='w-full bg-red-600 px-4 py-2 rounded-lg text-white text-sm hover:bg-red-700 transition'
                onClick={() => handleVisibilityChange(false)}
              >
                Make Private
              </button>
            </div>

            <button
              className='mt-4 w-full text-gray-400 text-sm hover:underline'
              onClick={toggleVisibilityModal}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Offscreen Hidden Card for Download */}
      <div
        style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
      >
        <div
          ref={hiddenCardRef}
          className='w-full max-w-sm mx-auto mb-6 bg-[#0a1122] rounded-xl shadow-lg border border-gray-700 text-white flex flex-col'
        >
          <div className='flex items-center p-4 border-b border-gray-700'>
            <img
              src={image}
              alt={username}
              crossOrigin='anonymous'
              className='w-12 h-12 rounded-full border border-gray-600'
            />
            <div className='ml-3'>
              <p className='font-semibold text-gray-200'>@{username}</p>
              <p className='text-gray-400 text-xs'>
                {note.modifiedDate
                  ? `Modified: ${formatDate(note.modifiedDate)} at ${formatTime(note.modifiedDate)}`
                  : `Created: ${formatDate(note.date)} at ${formatTime(note.date)}`}
              </p>
            </div>
          </div>

          <div className='p-4 flex-grow'>
            <h5 className='text-lg font-bold uppercase'>{note.title}</h5>
            {note.tag.length > 2 && <span className='text-[#FDC116] font-medium text-sm'># {note.tag}</span>}
            <p className='mb-0 mt-2 font-normal text-white whitespace-pre-wrap'>{note.description}</p>
          </div>

          <div className='text-gray-400 text-xs px-4 pb-3'>
            <p>
              Created: {formatDate(note.date)} at {formatTime(note.date)}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default NoteItem
