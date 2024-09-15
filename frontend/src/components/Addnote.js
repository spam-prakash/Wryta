import React, { useContext, useState } from 'react'
import noteContext from '../context/notes/NoteContext'
// import NoteItem from './NoteItem';
// import AddNote from './Addnote';

const Addnote = (props) => {
  const context = useContext(noteContext)
  // eslint-disable-next-line
  const { addNote } = context;

  const [note, setNote] = useState({ title: '', description: '', tag: '' })
  const handleClick = (e) => {
    e.preventDefault()
    addNote(note.title, note.description, note.tag)
    setNote({ title: '', description: '', tag: '' })
    props.showAlert('Note Added', '#D4EDDA')
  }

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value })
  }
  return (
    <div className='add mt-[6.5rem]'>
      <h1 className="text-white text-3xl font-['Open_sans'] font-bold mb-2 mx-4">
        Add a Note
      </h1>
      <form className='bg-[#0a1122] w-auto shadow-2xl rounded px-8 pt-6 pb-8 mb-4'>
        <div className='mb-4'>
          <label
            className='block text-white text-sm font-bold mb-2'
            htmlFor='title'
          >
            Title
          </label>
          <input
            value={note.title}
            id='title'
            name='title'
            type='text'
            className='shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-1 focus:shadow-outline outline-[#0F1729]'
            placeholder='Enter title'
            onChange={onChange}
          />
        </div>
        <div className='mb-4'>
          <label
            className='block text-white text-sm font-bold mb-2'
            htmlFor='description'
          >
            Description
          </label>
          <input
            value={note.description}
            id='description'
            name='description'
            className='shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-1 focus:shadow-outline outline-[#0F1729]'
            placeholder='Enter description'
            onChange={onChange}
          />
        </div>
        <div className='mb-4'>
          <label
            className='block text-white text-sm font-bold mb-2'
            htmlFor='tag'
          >
            Tag
          </label>
          <input
            value={note.tag}
            id='tag'
            name='tag'
            type='text'
            className='shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-1 focus:shadow-outline outline-[#0F1729]'
            placeholder='Enter tag'
            onChange={onChange}
          />
        </div>
        <div className='flex items-center justify-between'>
          <button
            type='button'
            className={`bg-[#FFD252] hover:bg-[#FDC116] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              note.title.length < 3 || note.description.length < 3
                ? 'disabled cursor-not-allowed opacity-50'
                : ''
            }`}
            onClick={handleClick}
            disabled={note.title.length < 3 || note.description.length < 3}
          >
            Add Note
          </button>
        </div>
      </form>
    </div>
  )
}

export default Addnote
