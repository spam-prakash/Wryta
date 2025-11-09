import React, { useEffect, useState, useRef, useContext } from 'react'
import noteContext from '../context/notes/NoteContext'
import HomeNoteItem from './NoteItems/HomeNoteItem'
import Addnote from './Addnote'
import Search from './Search' // Import the new Search component
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Loader from './utils/Loader'
import OwnNoteItem from './NoteItems/OwnNoteItem'
import NoteUpdateModal from './models/NoteUpdateModal'

const Home = (props) => {
  const { notes, getNotes, editNote } = useContext(noteContext)
  const [publicNotes, setPublicNotes] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [filterText, setFilterText] = useState('') // State for filtering notes
  const hostLink = process.env.REACT_APP_HOSTLINK
  const addNoteModalRef = useRef(null)
  const [isNoteAddModelOpen, setisNoteAddModelOpen] = useState(false)
  const [isUpdateNoteModalOpen, setIsUpdateNoteModalOpen] = useState(false)
  const [currentNoteForUpdate, setCurrentNoteForUpdate] = useState(null)
  // console.log('Image API:', process.env.REACT_APP_IMAGEAPI)

  // GET USER ID FROM LOACLSTORAGE TOKEN
  const token = localStorage.getItem('token')
  let userId = null

  if (token) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const decodedPayload = JSON.parse(window.atob(base64))
      userId = decodedPayload.user?.id || decodedPayload.id
    } catch (error) {
      console.error('Error decoding token:', error)
    }
  }

  const navigate = useNavigate()
  const location = window.location

  useEffect(() => {
    document.title = 'Wryta - Your notes secured in the cloud'
    fetchPublicNotes()
  }, [])

  useEffect(() => {
    // Check if the token is already in localStorage
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      navigate('/login') // Redirect to home page
      return // Exit early
    }

    // Extract the token from the URL
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    if (token) {
      // Set the token in local storage
      localStorage.setItem('token', token)

      // Clear the token from the URL to prevent duplicate processing
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)

      // Redirect to the desired page
      navigate('/')
    }
  }, [location.search, navigate])

  const fetchPublicNotes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${hostLink}/api/notes/public`)
      const data = await response.json()

      if (response.ok) {
        // Sort the notes by modifiedDate in descending order
        const sortedNotes = [...data.notes].sort((a, b) => {
          const dateA = new Date(a.publicDate || a.modifiedDate || a.date)
          const dateB = new Date(b.publicDate || b.modifiedDate || b.date)
          return dateB - dateA // latest (newest) note first
        })

        setPublicNotes(sortedNotes)
        setHasMore(data.hasMore)
      } else {
        props.showAlert('Failed to fetch public notes!', '#F8D7DA')
      }
    } catch (error) {
      props.showAlert('An error occurred while fetching public notes!', '#F8D7DA')
    }
    setLoading(false)
  }

  const toggleAddNoteModal = () => {
    if (addNoteModalRef.current) {
      addNoteModalRef.current.classList.toggle('hidden')
      setisNoteAddModelOpen(!isNoteAddModelOpen)
    }
  }

  const toggleUpdateNoteModal = () => {
    setIsUpdateNoteModalOpen(prev => !prev)
  }

  const updateNote = (note) => {
    setCurrentNoteForUpdate(note)
    setIsUpdateNoteModalOpen(true)
  }

  // Filter the notes based on the filter text
  const filteredNotes = publicNotes.filter((note) =>
    note.title.toLowerCase().includes(filterText.toLowerCase()) ||
    note.description.toLowerCase().includes(filterText.toLowerCase()) ||
    note.tag.toLowerCase().includes(filterText.toLowerCase()) ||
    note.userDetails.username.toLowerCase().includes(filterText.toLowerCase()) // Search by username
  )

  // console.log(filteredNotes)

  return (
    <>
      {loading && <Loader />}
      <Addnote
        modalRef={addNoteModalRef}
        showAlert={props.showAlert}
        toggleModal={toggleAddNoteModal}
        isOpen={isNoteAddModelOpen}
      />
      {/* Note update modal (owner only) */}
      <NoteUpdateModal
        currentNote={currentNoteForUpdate}
        editNote={editNote}
        showAlert={props.showAlert}
        toggleModal={toggleUpdateNoteModal}
        isOpen={isUpdateNoteModalOpen}
      />
      {/* Integrate the Search component */}
      <Search filterText={filterText} setFilterText={setFilterText} />
      <div className='mx-auto py-4 pt-10 sm:px-2 lg:px-4'>

        <div className='w-full flex flex-wrap text-white gap-3 mt-28'>
          {filteredNotes.map((note) =>

            <HomeNoteItem
              updateNote={updateNote}
              key={note._id}
              note={note}
              noteId={note._id}
              title={note.title}
              description={note.description}
              date={note.date}
              modifiedDate={note.modifiedDate}
              tag={note.tag}
              userIdThroughProps={note.userDetails._id}
              name={note.userDetails.name}
              username={note.userDetails.username}
              image={note.userDetails.image}
              showAlert={props.showAlert}
            />
          )}

        </div>

      </div>

      {/* Conditionally render the Add Note button */}
      {props.isAuthenticated && (
        <button
          onClick={toggleAddNoteModal}
          className='fixed bottom-10 right-10 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 focus:outline-none'
        >
          <Plus size={50} />
        </button>
      )}
    </>
  )
}

export default Home
