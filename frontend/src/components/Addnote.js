import React, { useContext, useState, useRef } from 'react'
import noteContext from '../context/notes/NoteContext'

const Addnote = ({ modalRef, showAlert, toggleModal }) => {
  const context = useContext(noteContext)
  const { addNote } = context

  const [note, setNote] = useState({ title: '', description: '', tag: '', isPublic: false })
  const descriptionRef = useRef(null)

  const onChange = (e) => {
    const { name, value } = e.target
    if (name === 'isPublic') {
      setNote({ ...note, [name]: value === 'true' }) // Convert string to boolean
    } else {
      setNote({ ...note, [name]: value })
    }
  }

  const autoResize = (e) => {
    e.target.style.height = 'auto'
    const maxHeight = e.target.scrollHeight > e.target.clientHeight ? e.target.scrollHeight : e.target.clientHeight
    e.target.style.height = Math.min(maxHeight, 10 * parseFloat(getComputedStyle(e.target).lineHeight)) + 'px'
  }

  const handleClick = (e) => {
    e.preventDefault()
    const isPublic = note.isPublic === true

    addNote(note.title, note.description, note.tag, isPublic)

    setNote({ title: '', description: '', tag: '', isPublic: false })
    showAlert('Successfully added!', '#D4EDDA')

    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto'
    }
    toggleModal()
    showAlert('Note added successfully!', '#D4EDDA')
  }

  return (
    <div
      ref={modalRef}
      className='hidden fixed top-0 left-0 z-50 w-full h-full backdrop-blur-sm bg-opacity-50 flex justify-center items-center'
    >
      <form className='bg-[#0a1122] md:w-[60vw] max-w-[50rem] shadow-2xl rounded px-8 pt-6 pb-8 mb-4'>
        {/* Title */}
        <div className='mb-4'>
          <label className='block text-white text-sm font-bold mb-2' htmlFor='title'>
            Title
          </label>
          <input
            id='title'
            name='title'
            type='text'
            value={note.title}
            className='shadow border rounded w-full py-2 px-3 text-black focus:outline-none'
            placeholder='Enter title'
            onChange={onChange}
          />
        </div>

        {/* Description */}
        <div className='mb-4'>
          <label className='block text-white text-sm font-bold mb-2' htmlFor='description'>
            Description
          </label>
          <textarea
            id='description'
            name='description'
            className='shadow border rounded w-full py-2 px-3 text-black focus:outline-none resize-none'
            placeholder='Enter description'
            value={note.description}
            onChange={onChange}
            rows='4'
          />
        </div>

        {/* Tag */}
        <div className='mb-4'>
          <label className='block text-white text-sm font-bold mb-2' htmlFor='tag'>
            Tag
          </label>
          <input
            id='tag'
            name='tag'
            type='text'
            value={note.tag}
            className='shadow border rounded w-full py-2 px-3 text-black focus:outline-none'
            placeholder='Enter tag'
            onChange={onChange}
          />
        </div>

        {/* Visibility */}
        <div className='mb-4'>
          <label className='block text-white text-sm font-bold mb-2' htmlFor='isPublic'>
            Visibility
          </label>
          <select
            name='isPublic'
            value={note.isPublic.toString()} // Convert boolean to string for select options
            onChange={onChange}
            className='shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-1 focus:shadow-outline outline-[#0F1729]'
          >
            <option value='false'>Private</option>
            <option value='true'>Public</option>
          </select>
        </div>

        <div className='flex items-center justify-between'>
          <button
            onClick={toggleModal}
            type='button'
            className='text-gray-700 mx-3 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md'
          >
            Close
          </button>
          <button
            type='button'
            className={`bg-[#FFD252] hover:bg-[#FDC116] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              note.description.length < 3
                ? 'disabled cursor-not-allowed opacity-50'
                : ''
            }`}
            onClick={handleClick}
            disabled={note.description.length < 3}
          >
            Add Note
          </button>
        </div>
      </form>
    </div>
  )
}

export default Addnote
