import React, { useState, useEffect } from 'react'

const NoteUpdateModal = ({ currentNote, editNote, showAlert, toggleModal, isOpen }) => {
  const [note, setNote] = useState({ id: '', etitle: '', edescription: '', etag: '' })

  useEffect(() => {
    if (currentNote) {
      setNote({
        id: currentNote._id,
        etitle: currentNote.title || '',
        edescription: currentNote.description || '',
        etag: currentNote.tag || ''
      })
    }
  }, [currentNote])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto'
    return () => (document.body.style.overflow = 'auto')
  }, [isOpen])

  const handleClick = async (e) => {
    e.preventDefault()

    if (note.edescription.length < 3) {
      showAlert('Description must be at least 3 characters', '#F8D7DA')
      return
    }

    try {
      await editNote(note.id, note.etitle, note.edescription, note.etag)
      toggleModal()
      showAlert('Note updated successfully!', '#D4EDDA')
    } catch (error) {
      console.error('Error updating note:', error)
      showAlert('Failed to update note', '#F8D7DA')
    }
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setNote({ ...note, [name]: value })
  }

  const handleClose = () => {
    setNote({ id: '', etitle: '', edescription: '', etag: '' })
    toggleModal()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black bg-opacity-50 p-4 ${!isOpen ? 'hidden' : ''}`}
    >
      <form className='bg-[#0a1122] w-full md:w-[60vw] max-w-[50rem] shadow-2xl rounded px-8 pt-6 pb-8'>
        {/* Title */}
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
            type='text'
            value={note.etitle}
            className='shadow border rounded w-full py-2 px-3 text-black focus:outline-none'
            placeholder='Enter title'
            onChange={onChange}
            autoComplete='off'
          />
        </div>

        {/* Description */}
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
            className='shadow border rounded w-full py-2 px-3 text-black focus:outline-none resize-none'
            placeholder='Enter description'
            value={note.edescription}
            onChange={onChange}
            rows='4'
          />
        </div>

        {/* Tag */}
        <div className='mb-4'>
          <label className='block text-white text-sm font-bold mb-2' htmlFor='etag'>
            Tag
          </label>
          <input
            id='etag'
            name='etag'
            type='text'
            value={note.etag}
            className='shadow border rounded w-full py-2 px-3 text-black focus:outline-none'
            placeholder='Enter tag'
            onChange={onChange}
            autoComplete='off'
          />
        </div>

        {/* Buttons */}
        <div className='flex items-center justify-between'>
          <button
            onClick={handleClose}
            type='button'
            className='text-gray-700 mx-3 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md'
          >
            Close
          </button>
          <button
            type='submit'
            className={`bg-[#FFD252] hover:bg-[#FDC116] text-white font-bold py-2 px-4 rounded ${
              note.edescription.length < 3
                ? 'cursor-not-allowed opacity-50'
                : ''
            }`}
            onClick={handleClick}
            disabled={note.edescription.length < 3}
          >
            Update Note
          </button>
        </div>
      </form>
    </div>
  )
}

export default NoteUpdateModal
