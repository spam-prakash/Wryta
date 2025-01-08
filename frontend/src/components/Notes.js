import React, { useContext, useEffect, useState, useRef } from 'react'
import noteContext from '../context/notes/NoteContext'
import NoteItem from './NoteItem'
import { useNavigate } from 'react-router-dom'
import Addnote from './Addnote'

const Notes = (props) => {
  const { notes, getNotes, editNote } = useContext(noteContext)
  const navigate = useNavigate()
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    } else {
      getNotes()
    }
  }, [getNotes, navigate])

  const modalRef = useRef(null)
  const descriptionRef = useRef(null)

  // const refClose = useRef(null);
  const [note, setNote] = useState({ id: '', etitle: '', edescription: '', etag: '' })

  const toggleModal = (e) => {
    modalRef.current.classList.toggle('hidden')
    // e.preventDefault()
  }
  const updateNote = (currentNote) => {
    modalRef.current.classList.toggle('hidden')
    setNote({ id: currentNote._id, etitle: currentNote.title, edescription: currentNote.description, etag: currentNote.tag })
  }

  const handleClick = (e) => {
    editNote(note.id, note.etitle, note.edescription, note.etag)
    modalRef.current.classList.toggle('hidden')
    props.showAlert('Note updated successfully', '#D4EDDA')
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto' // Reset the height of the textarea
      autoResize({ target: descriptionRef.current }) // Call autoResize for the description
    }
  }

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value })
  }

  const autoResize = (e) => {
    e.target.style.height = 'auto'
    const maxHeight = e.target.scrollHeight > e.target.clientHeight ? e.target.scrollHeight : e.target.clientHeight
    e.target.style.height = Math.min(maxHeight, 10 * parseFloat(getComputedStyle(e.target).lineHeight)) + 'px'
  }

  return (
    <>
      {/* Button to toggle modal */}

      <Addnote showAlert={props.showAlert} />

      <button
        onClick={toggleModal}
        className=' text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 hidden'
      >
        Toggle Modal
      </button>

      {/* Modal */}
      <div
        ref={modalRef}
        id='default-modal'
        className='hidden fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-50 flex justify-center items-center'
      >
        <form className='bg-[#0a1122] w-auto shadow-2xl rounded px-8 pt-6 pb-8 mb-4'>
          <div className='mb-4'>
            <label
              className='block text-white text-sm font-bold mb-2'
              htmlFor='etitle'
            >
              Title
            </label>
            <input
              id='etitle'
              name='etitle'
              type='text' value={note.etitle}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-1 focus:shadow-outline outline-[#0F1729]'
              placeholder='Enter title'
              onChange={onChange}
            />
          </div>
          <div className='mb-4'>
            <label
              className='block text-white text-sm font-bold mb-2'
              htmlFor='edescription'
            >
              Description
            </label>
            <textarea
              id='edescription'
              name='edescription'
              className='form-control shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-1 focus:shadow-outline outline-[#0F1729] overflow-hidden resize-none'
              placeholder='Enter description'
              value={note.edescription}
              onChange={(e) => {
                onChange(e)
                autoResize(e)
              }}
              onInput={autoResize} // Extra precaution to handle dynamic changes
              ref={descriptionRef} rows='4'
            />

          </div>
          <div className='mb-4'>
            <label
              className='block text-white text-sm font-bold mb-2'
              htmlFor='etag'
            >
              Tag
            </label>
            <input
              id='etag'
              name='etag'
              type='text' value={note.etag}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-1 focus:shadow-outline outline-[#0F1729]'
              placeholder='Enter tag'
              onChange={onChange}
            />
          </div>

          <div className='flex items-center justify-between'>
            <button onClick={toggleModal} type='button' className='text-gray-700 mx-3 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md'>Close</button>
            {/* <button onClick={handleClick} type="button" className="bg-[#FFD252] mx-3 hover:bg-[#FDC116] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outlin">Edit Note</button> */}

            <button
              type='button'
              className={`bg-[#FFD252] hover:bg-[#FDC116] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              note.etitle.length < 3 || note.edescription.length < 3
                ? 'disabled cursor-not-allowed opacity-50'
                : ''
            }`}
              onClick={handleClick}
              disabled={note.etitle.length < 3 || note.edescription.length < 3}
            >
              Edit Note
            </button>
          </div>
        </form>
      </div>

      {/* List of Notes */}
      <h1 className='text-white text-3xl font-semibold my-4'>Your Notes</h1>
      <div className='flex flex-wrap text-white gap-3'>
        {notes.length === 0 && 'No Notes To Display'}
        {notes.map((note) => {
          return <NoteItem key={note._id} showAlert={props.showAlert} updateNote={updateNote} note={note} />
        })}
      </div>
    </>
  )
}

export default Notes
