import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import InteractionButtons from './InteractionButtons'

const SharedNote = (props) => {
  const { id } = useParams()
  const [note, setNote] = useState(null)
  const hostLink = process.env.REACT_APP_HOSTLINK

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`${hostLink}/api/notes/note/${id}`)
        const data = await response.json()
        setNote(data)
      } catch (error) {
        console.error('Error fetching note:', error)
      }
    }
    fetchNote()
  }, [id])

  if (!note) {
    return <p>Loading...</p>
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const options = { day: 'numeric', month: 'short', year: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    const options = { hour: '2-digit', minute: '2-digit', hour12: false }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-[#0a1122]'>
      <div className='text-white w-full max-w-sm mx-auto mb-6 bg-[#0a1122] rounded-xl shadow-lg border border-gray-700 flex flex-col'>
        {/* Header (User Info) */}
        <div className='flex flex-col p-4 pb-1 border-b border-gray-700'>
          <div className='flex items-center mb-1'>
            <Link to={`/${note.user.username}`}>
              <img
                src={note.user.image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${note.user.username}`}
                alt={note.user.name}
                className='w-10 h-10 rounded-full border border-gray-600'
              />
            </Link>
            <div>
              <Link to={`/${note.user.username}`} className='ml-3 font-semibold text-gray-200 hover:underline'>
                @{note.user.username}
              </Link>
              <div className='text-gray-400 text-xs ml-4'>
                {note.modifiedDate
                  ? (
                    <p>{formatDate(note.modifiedDate)} at {formatTime(note.modifiedDate)}</p>
                    )
                  : (
                    <p>{formatDate(note.date)} at {formatTime(note.date)}</p>
                    )}
              </div>
            </div>
          </div>
        </div>

        {/* Note Content */}
        <div className='p-4'>
          <h5 className='text-lg font-bold text-white'>{note.title}</h5>
          {note.tag && <p className='text-[#FDC116] font-medium text-sm'># {note.tag}</p>}
          <p className='mt-2 font-normal text-white whitespace-pre-wrap'>{note.description}</p>
        </div>
        {/* Buttons */}
        <InteractionButtons
          className='border-t border-gray-700 mt-auto'
          title={note.title}
          tag={note.tag}
          description={note.description}
          showAlert={props.showAlert}
          noteId={note.noteId}
        />
      </div>
    </div>
  )
}

export default SharedNote
