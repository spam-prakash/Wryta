import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useContext, useRef } from 'react'
import defaultUser from '../assets/user.png' // Default user image
import OtherProfileNoteItem from './OtherProfileNoteItem'
import noteContext from '../context/notes/NoteContext'
import NoteItem from './NoteItem'
import NoteUpdateModal from './NoteUpdateModal'
import Addnote from './Addnote'
import { Plus, Edit3 } from 'lucide-react'

const OthersProfile = ({ loggedInUser, showAlert }) => {
  const { notes, getNotes, editNote } = useContext(noteContext)
  const { username: initialUsername } = useParams()
  const navigate = useNavigate()
  const [username, setUsername] = useState(initialUsername)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [sortCriteria, setSortCriteria] = useState('modifiedDate')
  const [sortOrder, setSortOrder] = useState('desc')
  const hostLink = process.env.REACT_APP_HOSTLINK

  const modalRef = useRef(null)
  const [currentNote, setCurrentNote] = useState(null)

  const addNoteModalRef = useRef(null)
  const editProfileModalRef = useRef(null)

  const [editProfileData, setEditProfileData] = useState({
    username: '',
    name: ''
  })

  const toggleAddNoteModal = () => {
    if (addNoteModalRef.current) {
      addNoteModalRef.current.classList.toggle('hidden')
    }
  }

  const toggleEditProfileModal = () => {
    if (editProfileModalRef.current) {
      editProfileModalRef.current.classList.toggle('hidden')
    }
  }

  const fetchUserProfile = async (usernameToFetch) => {
    try {
      const response = await fetch(`${hostLink}/api/user/${usernameToFetch}`)
      const data = await response.json()

      if (response.ok) {
        setUser(data)
      } else {
        setError('User not found')
      }
    } catch (error) {
      setError('An error occurred while fetching the user profile.')
    }
  }

  useEffect(() => {
    if (username) {
      fetchUserProfile(username)
    }
  }, [username])

  useEffect(() => {
    // Fetch notes if the logged-in user is viewing their own profile
    if (loggedInUser?.username === username) {
      getNotes()
    }
  }, [loggedInUser, username, getNotes])

  useEffect(() => {
    // Set the document title based on the user data
    if (user) {
      document.title = `${username} || iNoteBook`
    }
  }, [user])

  if (error) return <p className='text-red-500'>{error}</p>
  if (!user) return <p>Loading...</p>

  const profilePic = user.profilePic || defaultUser

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return isNaN(date)
      ? 'Invalid Date'
      : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
  }

  // If the logged-in user is viewing their own profile, include private notes
  const notesToDisplay =
    loggedInUser?.username === username ? notes : user.publicNotes || []

  // Sort the notes based on the selected criteria and order
  const sortedNotesToDisplay = notesToDisplay.sort((a, b) => {
    const dateA = new Date(a[sortCriteria] || a.date)
    const dateB = new Date(b[sortCriteria] || b.date)
    return sortOrder === 'old' ? dateA - dateB : dateB - dateA
  })

  const toggleModal = () => {
    modalRef.current.classList.toggle('hidden')
  }

  const updateNote = (note) => {
    setCurrentNote(note)
    toggleModal()
  }

  const handleEditProfileChange = (e) => {
    setEditProfileData({ ...editProfileData, [e.target.name]: e.target.value })
  }

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault()
    const updatedData = {
      username: editProfileData.username || user.username,
      name: editProfileData.name || user.name
    }

    const response = await fetch(`${hostLink}/api/auth/updateprofile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify(updatedData)
    })
    const json = await response.json()
    console.log(json)
    if (json.success) {
      setUser(json.user)
      toggleEditProfileModal()
      if (updatedData.username !== user.username) {
        setUsername(updatedData.username)
        navigate(`/${updatedData.username}`)
        // fetchUserProfile(updatedData.username)
        window.location.reload()
        showAlert('Profile updated successfully', '#D4EDDA')
      }
    } else {
      showAlert('Failed to update profile', '#F8D7DA')
    }
  }

  // Category & Tag Data
  const categories = {
    '✨ All': [],
    '📚 General': ['General', 'Note', 'Task', 'Ideas'],
    '📂 Work': ['Meetings', 'Projects', 'Work'],
    '🏡 Personal': ['Reading', 'Poem', 'Shayari', 'Thought'],
    '💰 Future': ['Budgeting', 'Future Plans', 'Goals']
  }

  return (
    <>
      <Addnote
        modalRef={addNoteModalRef}
        showAlert={showAlert}
        toggleModal={toggleAddNoteModal}
      />
      <NoteUpdateModal
        modalRef={modalRef}
        currentNote={currentNote}
        categories={categories}
        editNote={editNote}
        showAlert={showAlert}
        toggleModal={toggleModal}
      />

      {/* Edit Profile Modal */}
      <div
        ref={editProfileModalRef}
        className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-10'
      >
        <div className='bg-[#1E293B] rounded-lg p-6 w-full max-w-md'>
          <h2 className='text-xl font-bold mb-4 text-white'>Edit Profile</h2>
          <form onSubmit={handleEditProfileSubmit}>
            <div className='mb-4'>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-300'
              >
                Username
              </label>
              <input
                id='username'
                name='username'
                type='text'
                value={editProfileData.username}
                onChange={handleEditProfileChange}
                className='mt-1 block w-full rounded-md border-gray-600 bg-[#374151] text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              />
            </div>
            <div className='mb-4'>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-300'
              >
                Name
              </label>
              <input
                id='name'
                name='name'
                type='text'
                value={editProfileData.name}
                onChange={handleEditProfileChange}
                className='mt-1 block w-full rounded-md border-gray-600 bg-[#374151] text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              />
            </div>
            <div className='flex justify-end'>
              <button
                type='button'
                onClick={toggleEditProfileModal}
                className='mr-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700'
              >
                Cancel
              </button>
              <button
                type='submit'
                className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className='flex flex-col items-center text-white px-4'>
        {/* Profile Section */}
        <div className='flex flex-col md:flex-row items-center w-full max-w-2xl py-6 mt-20'>
          <a href={profilePic} target='_blank' rel='noreferrer'>
            <img
              className='size-40 rounded-full border-4 border-gray-400'
              src={profilePic}
              alt='Profile'
            />
          </a>
          <div className='mx-6'>
            <h2 className='text-2xl font-semibold mt-2'>{user.name}</h2>
            <p className='text-gray-400'>@{username}</p>
            <p className='text-gray-300 text-sm'>{user.email}</p>
          </div>

          <div className='mt-4 flex space-x-6 text-center'>
            <div>
              <p className='text-xl font-bold'>{user.totalNotes}</p>
              <p className='text-gray-400 text-sm'>Total Notes</p>
            </div>
            <div>
              <p className='text-xl font-bold'>{user.publicNotesCount}</p>
              <p className='text-gray-400 text-sm'>Public Notes</p>
            </div>
          </div>

          {/* Edit Icon */}
          {loggedInUser?.username === username && (
            <button
              onClick={() => {
                setEditProfileData({ username: user.username, name: user.name })
                toggleEditProfileModal()
              }}
              className='ml-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 focus:outline-none'
            >
              <Edit3 size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Sorting Options */}
      <div className='flex gap-2 mb-3'>
        <select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value)}
          className='px-4 py-2 text-sm rounded-full border bg-[#1E293B] text-white border-gray-600 hover:border-white hover:bg-[#374151]'
        >
          <option value='modifiedDate'>Modified Date</option>
          <option value='date'>Created Date</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className='px-4 py-2 text-sm rounded-full border bg-[#1E293B] text-white border-gray-600 hover:border-white hover:bg-[#374151]'
        >
          <option value='new'>Newest</option>
          <option value='old'>Oldest</option>
        </select>
      </div>

      {/* Notes Section */}
      <div className='w-full flex flex-wrap text-white gap-3 mt-4'>
        {sortedNotesToDisplay.length > 0
          ? (
              sortedNotesToDisplay.map((note) =>
                loggedInUser?.username === username
                  ? (
                    <NoteItem
    key={note._id}
    note={note}
    updateNote={updateNote}
    showAlert={showAlert}
  />
                    )
                  : (
                    <OtherProfileNoteItem
    key={note._id}
    title={note.title}
    description={note.description}
    date={note.date}
    modifiedDate={note.modifiedDate}
    tag={note.tag}
    showAlert={showAlert}
  />
                    )
              )
            )
          : (
            <p className='text-center text-gray-400'>No notes available.</p>
            )}
      </div>

      {/* Conditionally render the Add Note button */}
      {loggedInUser && (
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

export default OthersProfile
