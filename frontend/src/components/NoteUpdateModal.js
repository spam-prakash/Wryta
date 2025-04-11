import React, { useState, useEffect } from 'react'

const NoteUpdateModal = ({ modalRef, currentNote, editNote, showAlert, toggleModal }) => {
  const [note, setNote] = useState({ id: '', etitle: '', edescription: '', etag: '' })

  useEffect(() => {
    if (currentNote) {
      setNote({
        id: currentNote._id,
        etitle: currentNote.title,
        edescription: currentNote.description,
        etag: currentNote.tag
      })
    }
  }, [currentNote])

  const handleClick = () => {
    editNote(note.id, note.etitle, note.edescription, note.etag)
    toggleModal()
    showAlert('Note updated successfully!', '#D4EDDA')
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setNote({ ...note, [name]: value })
  }

  return (
    <div
      ref={modalRef}
      className='hidden fixed top-0 left-0 z-50 w-full h-full backdrop-blur-sm bg-opacity-50 flex justify-center items-center'
    >
      <form className='bg-[#0a1122] md:w-[60vw] max-w-[50rem] shadow-2xl rounded px-8 pt-6 pb-8 mb-4'>
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
          />
        </div>

        {/* Buttons */}
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
            className={`bg-[#FFD252] hover:bg-[#FDC116] text-white font-bold py-2 px-4 rounded ${
              note.edescription.length < 3
                ? 'cursor-not-allowed opacity-50'
                : ''
            }`}
            onClick={handleClick}
            disabled={
              note.edescription.length < 3
            }
          >
            Edit Note
          </button>
        </div>
      </form>
    </div>
  )
}

export default NoteUpdateModal
