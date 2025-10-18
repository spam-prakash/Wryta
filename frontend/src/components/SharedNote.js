import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import InteractionButtons from './InteractionButtons'
import renderWithLinksAndMentions from './utils/renderWithLinksAndMentions'
import Addnote from './Addnote'
import Loader from './utils/Loader'
import { Plus } from 'lucide-react'
import Search from './Search'

const SharedNote = (props) => {
  const { loggedInUser, showAlert } = props
  const { id } = useParams()
  const [note, setNote] = useState(null)
  const [error, setError] = useState(null)
  const hiddenCardRef = useRef(null)
  const addNoteModalRef = useRef(null)
  const [filterText, setFilterText] = useState('')

  const hostLink = process.env.REACT_APP_HOSTLINK
  const imageAPI = process.env.REACT_APP_IMAGEAPI
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`${hostLink}/api/notes/note/${id}`, {
          method: 'GET',
          headers: {
            'auth-token': token || ''
          }
        })
        const data = await response.json()

        if (!response.ok) {
          setError(data.message || 'Failed to load note')
          return
        }

        setNote(data.note || data)
      } catch (err) {
        console.error('Error fetching note:', err)
        setError('Invalid Note Id')
      }
    }

    fetchNote()
  }, [id])

  const toggleAddNoteModal = () => {
    if (addNoteModalRef.current) {
      addNoteModalRef.current.classList.toggle('hidden')
    }
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

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen z-50 inset-0 bg-opacity-50 md:backdrop-blur-sm'>
        <div className='text-center text-gray-300'>
          <h2 className='text-2xl font-bold mb-2'>404 Unable to load note</h2>
          <p className='text-gray-400'>{error}</p>
        </div>
      </div>
    )
  }

  if (!note) return <Loader />

  return (
    <>
      {/* Add Note Modal */}
      <Addnote modalRef={addNoteModalRef} showAlert={showAlert} toggleModal={toggleAddNoteModal} />

      <Search filterText={filterText} setFilterText={setFilterText} />

      {/* ✅ Add Note Button only for logged-in users */}
      {loggedInUser && (
        <button
          onClick={toggleAddNoteModal}
          className='fixed bottom-10 right-10 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 focus:outline-none'
        >
          <Plus size={50} />
        </button>
      )}

      {/* Main Note Card */}
      <div className='flex items-center justify-center min-h-screen z-20 inset-0 bg-opacity-50'>
        <div className='text-white w-full max-w-sm mx-auto mb-6 bg-[#0a1122] rounded-xl shadow-lg border border-gray-700 flex flex-col mt-20'>
          {/* Header */}
          <div className='flex flex-col p-4 pb-1 border-b border-gray-700'>
            <div className='flex items-center mb-1'>
              <Link to={`/u/${note.user.username}`}>
                <img
                  src={note.user.image ? note.user.image : `${imageAPI}${encodeURIComponent(note.user.username)}`}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = `${imageAPI}${encodeURIComponent(note.user.username)}`
                  }}
                  alt={note.user.username}
                  className='w-10 h-10 rounded-full object-cover'
                />
              </Link>

              <div>
                <Link to={`/u/${note.user.username}`} className='ml-3 font-semibold text-gray-200 hover:underline'>
                  @{note.user.username}
                </Link>
                <div className='text-gray-400 text-xs ml-4'>
                  {note.modifiedDate
                    ? <p>{formatDate(note.modifiedDate)} at {formatTime(note.modifiedDate)}</p>
                    : <p>{formatDate(note.date)} at {formatTime(note.date)}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Note Content */}
          <div className='p-4'>
            <h5 className='text-lg font-bold text-white'>{note.title}</h5>
            {note.tag && <p className='text-[#FDC116] font-medium text-sm'># {note.tag}</p>}
            <p className='mt-2 font-normal text-white whitespace-pre-wrap'>
              {renderWithLinksAndMentions(note.description)}
            </p>
          </div>

          {/* Buttons */}
          <InteractionButtons
            className='border-t border-gray-700 mt-auto'
            title={note.title}
            tag={note.tag}
            cardRef={hiddenCardRef}
            description={note.description}
            showAlert={showAlert}
            noteId={note._id}
            note={note}
          />
        </div>
      </div>

      {/* Hidden Card for Download */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
        <div
          ref={hiddenCardRef}
          className='w-full max-w-sm mx-auto mb-6 bg-[#0a1122] rounded-xl shadow-lg border border-gray-700 text-white flex flex-col'
        >
          <div className='flex flex-col p-4 pb-1 border-b border-gray-700'>
            <div className='flex items-center mb-1'>
              <Link to={`/${note.user.username}`}>
                <img
                  src={note.user.image || `${imageAPI}${encodeURIComponent(note.user.username)}`}
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
                    ? <p>{formatDate(note.modifiedDate)} at {formatTime(note.modifiedDate)}</p>
                    : <p>{formatDate(note.date)} at {formatTime(note.date)}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className='p-4 flex-grow'>
            <h5 className='text-lg font-bold uppercase'>{note.title}</h5>
            {note.tag.length > 2 && <span className='text-[#FDC116] font-medium text-sm'># {note.tag}</span>}
            <p className='mb-0 mt-2 font-normal text-white whitespace-pre-wrap'>{note.description}</p>
          </div>

          <div className='text-gray-400 text-xs px-4 pb-3'>
            <p>Created: {formatDate(note.date)} at {formatTime(note.date)}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default SharedNote
