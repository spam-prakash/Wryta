import React, { useContext, useState, useEffect, useRef } from 'react'
import deleteIcon from '../assets/delete.png'
import editIcon from '../assets/edit.png'
import noteContext from '../context/notes/NoteContext'
import NoteModal from './NoteModal'

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
  const { deleteNote } = context

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef(null)

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight)
    }
  }, [note.description])

  return (
    <>
      <div className='text-white flex-auto md:basis-1/4 px-2 mb-4 '>
        <div className='max-w-[40rem] p-6 bg-[#0a1122] shadow-2xl border-none rounded-lg group h-64 flex flex-col justify-between'>
          <div className='flex-grow overflow-hidden' ref={contentRef}>
            <div className='flex justify-between'>
              <h5 className='mb-2 text-2xl font-bold tracking-tight text-white'>{note.title}</h5>
              <div className='flex gap-3'>
                <img onClick={() => { deleteNote(note._id); props.showAlert('Note deleted !', '#D4EDDA') }} src={deleteIcon} className='size-6 cursor-pointer' alt='Delete' />
                <img onClick={() => { updateNote(note) }} src={editIcon} className='size-6 cursor-pointer' alt='Edit' />
              </div>
            </div>
            <span className='text-white cursor-text bg-transparent font-medium rounded-lg text-base mb-0'>
              <span className='text-[#FDC116]'># </span>{note.tag}
            </span>
            <p className='mb-0 font-normal text-white whitespace-pre-wrap'>{note.description}</p>
          </div>
          <div className='mt-2'>
            {isOverflowing && <button onClick={toggleModal} className='text-xs text-blue-500'>Read More</button>}
            {note.modifiedDate && (
              <p className='text-xs mt-2 text-slate-500'>Modified: {formatDate(note.modifiedDate)} at {formatTime(note.modifiedDate)}</p>
            )}
            <p className='text-xs mt-2 text-slate-500'>Created: {formatDate(note.date)} at {formatTime(note.date)}</p>
          </div>
        </div>
      </div>

      {isModalOpen && <NoteModal note={note} onClose={toggleModal} />}
    </>
  )
}

export default NoteItem