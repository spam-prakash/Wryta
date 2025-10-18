import React, { useContext, useState, useEffect, useRef } from 'react'
import deleteIcon from '../../assets/delete.png'
import editIcon from '../../assets/edit.png'
import noteContext from '../../context/notes/NoteContext'
import NoteModal from '../NoteModal'
import { Lock, LockOpen, X, Copy, Download, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import InteractionButtons from '../InteractionButtons'
import HiddenDownloadCard from '../utils/HiddenDownloadCard'
import renderWithLinksAndMentions from '../utils/renderWithLinksAndMentions'

const OwnNoteItem = (props) => {
  const { username } = props
  const imageAPI = process.env.REACT_APP_IMAGEAPI
  const image = props.image || `${imageAPI}${encodeURIComponent(username)}`
  const { note, updateNote, showAlert } = props
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
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => showAlert('Note successfully copied!', '#D4EDDA'))
      .catch(() => showAlert('Failed to copy note.', '#F8D7DA'))
  }

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
                  Modified: {formatDate(note.modifiedDate)} at {formatTime(note.modifiedDate)}
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
          />
        </div>
      </div>

      {isModalOpen && <NoteModal note={note} onClose={toggleModal} />}

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
