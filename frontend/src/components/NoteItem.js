import React, { useContext, useState, useEffect, useRef } from 'react'
import deleteIcon from '../assets/delete.png'
import editIcon from '../assets/edit.png'
import noteContext from '../context/notes/NoteContext'
import NoteModal from './NoteModal'
// import { useNavigate } from 'react-router-dom'
import { Lock, LockOpen, X, Copy } from 'lucide-react'

const NoteItem = (props) => {
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: false }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  const context = useContext(noteContext)
  const { note } = props
  const { updateNote } = props
  const { deleteNote, updateVisibility } = context
  const [liked, setLiked] = useState(false)
  const [copiedText, setCopiedText] = useState('')
  const [copiedElement, setCopiedElement] = useState('')

  const copyToClipboard = (element, text) => {
    const textToCopy = `Title: ${note.title}\nTag: ${note.tag}\n\nDescription:\n${note.description}`
    navigator.clipboard.writeText(textToCopy)
    setCopiedText(textToCopy) // Set state to show copied text
    // setCopiedElement(element)
    props.showAlert('Note Successfully copied!', '#D4EDDA')
    setTimeout(() => setCopiedText(''), 1500) // Clear message after 1.5 sec
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef(null)
  const modalRef = useRef(null) // Ref for modal to handle outside click

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  const toggleVisibilityModal = () => {
    setIsVisibilityModalOpen(!isVisibilityModalOpen)
  }

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight)
    }
  }, [note.description])

  const handleVisibilityChange = (newVisibility) => {
    updateVisibility(note._id, newVisibility)
    setIsVisibilityModalOpen(false)
  }

  // Close modal when clicking outside
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
        {/* Header: Title & Actions */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-gray-700'>
          <h5 className='text-lg font-bold text-white truncate'>{note.title}</h5>
          <div className='flex gap-3'>
            <img
              onClick={() => { deleteNote(note._id); props.showAlert('Note deleted!', '#D4EDDA') }}
              src={deleteIcon}
              className='size-6 cursor-pointer'
              alt='Delete'
            />
            <img
              onClick={() => { updateNote(note) }}
              src={editIcon}
              className='size-6 cursor-pointer'
              alt='Edit'
            />
          </div>
        </div>

        {/* Note Content */}
        <div className='p-4 flex-grow'>
          <span className='text-[#FDC116] font-medium text-sm'># {note.tag}</span>
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

        {/* Footer: Timestamps & Visibility */}
        <div className='px-4 pb-3 border-t border-gray-700 flex justify-between items-center'>
          <div className='text-gray-400 text-xs'>
            {note.modifiedDate && (
              <p>Modified: {formatDate(note.modifiedDate)} at {formatTime(note.modifiedDate)}</p>
            )}
            <p>Created: {formatDate(note.date)} at {formatTime(note.date)}</p>
          </div>
          <div className='flex gap-3 left-icons'>
            <button
              onClick={(e) => copyToClipboard(e.currentTarget, `Title: ${note.title}\nTag: ${note.tag}\nDescription: ${note.description}`)}
              className='flex items-center space-x-2'
            >
              <Copy />
            </button>
            <button
              onClick={toggleVisibilityModal}
              className={`text-xs p-2 rounded-full transition ${
              note.isPublic ? 'bg-green-600' : 'bg-red-600'
            }`}
            >
              {note.isPublic ? <LockOpen size={18} /> : <Lock size={18} />}
            </button>
          </div>
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
            {/* Modal Header */}
            <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
              <h3 className='text-white text-lg font-semibold'>Change Visibility</h3>
              <button onClick={toggleVisibilityModal} className='text-gray-400 hover:text-white'>
                <X size={20} />
              </button>
            </div>

            {/* Visibility Buttons */}
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

            {/* Cancel Button */}
            <button
              className='mt-4 w-full text-gray-400 text-sm hover:underline'
              onClick={toggleVisibilityModal}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default NoteItem
