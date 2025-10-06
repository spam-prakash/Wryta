import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useContext, useRef } from 'react'
import OtherProfileNoteItem from './OtherProfileNoteItem'
import noteContext from '../context/notes/NoteContext'
import NoteItem from './NoteItem'
import NoteUpdateModal from './NoteUpdateModal'
import Addnote from './Addnote'
import { Plus, Edit3 } from 'lucide-react'
import Search from './Search' // Import the Search component
import UserListModal from './UserListModal'
import Loader from './utils/Loader'

const OthersProfile = ({ loggedInUser, showAlert }) => {
  const { notes, getNotes, editNote } = useContext(noteContext)
  const [modalType, setModalType] = useState(null)
  const openModal = (type) => setModalType(type)
  const closeModal = () => setModalType(null)
  const { username: initialUsername } = useParams()
  const [username, setUsername] = useState(initialUsername)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [sortCriteria, setSortCriteria] = useState('modifiedDate')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isFollowing, setIsFollowing] = useState()
  const [filterText, setFilterText] = useState('')
  const hostLink = process.env.REACT_APP_HOSTLINK

  const modalRef = useRef(null)
  const [currentNote, setCurrentNote] = useState(null)
  const addNoteModalRef = useRef(null)
  const editProfileModalRef = useRef(null)
  const navigate = useNavigate()
  const location = window.location

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      navigate('/login')
      return
    }

    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    if (token) {
      localStorage.setItem('token', token)
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
      navigate('/')
    }
  }, [location.search, navigate])

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

  const fetchUserProfile = async (username) => {
    try {
      const response = await fetch(`${hostLink}/api/user/${username}`, {
        headers: {
          'auth-token': localStorage.getItem('token')
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError('User not found.')
        } else {
          setError('Failed to load user profile.')
        }
        setUser(null)
        return
      }

      const data = await response.json()
      setUser(data)
      // console.log(data)
      setIsFollowing(data.isFollowing)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setError('Something went wrong while loading the user profile.')
    }
  }

  useEffect(() => {
    if (username) {
      fetchUserProfile(username)
    }
  }, [username])

  useEffect(() => {
    setUsername(initialUsername)
  }, [initialUsername])

  useEffect(() => {
    if (loggedInUser?.username === username) {
      getNotes()
    }
  }, [username, loggedInUser?.username, getNotes])

  useEffect(() => {
    if (user) {
      document.title = `${username} || Wryta`
    }
  }, [user, username])

  // Custom 404 / error screen
  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-[#0a1122]'>
        <div className='text-center text-gray-300'>
          <h2 className='text-2xl font-bold mb-2'>
            {error.includes('User') ? '404 User Not Found' : 'Unable to load user'}
          </h2>
          <p className='text-gray-400'>{error}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Loader />
    )
  }

  const profilePic = user.profilePic || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`

  const notesToDisplay =
    loggedInUser?.username === username ? notes : user.publicNotes || []

  const filteredNotes = notesToDisplay.filter((note) =>
    note.title.toLowerCase().includes(filterText.toLowerCase()) ||
    note.description.toLowerCase().includes(filterText.toLowerCase()) ||
    note.tag.toLowerCase().includes(filterText.toLowerCase())
  )

  const sortedNotesToDisplay = filteredNotes.sort((a, b) => {
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
    if (json.success) {
      setUser(json.user)
      toggleEditProfileModal()
      if (updatedData.username !== user.username) {
        setUsername(updatedData.username)
        navigate(`/u/${updatedData.username}`)
        window.location.reload()
        showAlert('Profile updated successfully', '#D4EDDA')
      }
    } else {
      showAlert('Failed to update profile', '#F8D7DA')
    }
  }

  const categories = {
    '✨ All': [],
    '📚 General': ['General', 'Note', 'Task', 'Ideas'],
    '📂 Work': ['Meetings', 'Projects', 'Work'],
    '🏡 Personal': ['Reading', 'Poem', 'Shayari', 'Thought'],
    '💰 Future': ['Budgeting', 'Future Plans', 'Goals']
  }

  const followUnfollow = async () => {
    try {
      if (isFollowing) {
        await fetch(`${hostLink}/api/user/unfollow/${user.id}`, {
          method: 'POST',
          headers: {
            'auth-token': localStorage.getItem('token')
          }
        })
        setIsFollowing(false)
      } else {
        await fetch(`${hostLink}/api/user/follow/${user.id}`, {
          method: 'POST',
          headers: {
            'auth-token': localStorage.getItem('token')
          }
        })
        setIsFollowing(true)
      }
      fetchUserProfile(username)
    } catch (error) {
      console.error('Error updating follow status:', error)
    }
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
        className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-10 p-4 sm:p-0'
      >
        <div className='bg-[#1E293B] rounded-lg p-6 w-full max-w-md'>
          <h2 className='text-xl font-bold mb-4 text-white'>Edit Profile</h2>
          <form onSubmit={handleEditProfileSubmit}>
            <div className='mb-4'>
              <label htmlFor='username' className='block text-sm font-medium text-gray-300'>
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
              <label htmlFor='name' className='block text-sm font-medium text-gray-300'>
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

      {/* Profile Section */}
      <div className='flex flex-col items-center text-white px-4'>
        <div className='flex flex-col md:flex-row items-center w-full max-w-4xl py-6 mt-28'>
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
            <div
              className='cursor-pointer text-center hover:opacity-80'
              onClick={() => openModal('followers')}
            >
              <p className='text-xl font-bold'>{user.followerCount}</p>
              <p className='text-gray-400 text-sm'>Followers</p>
            </div>

            <div
              className='cursor-pointer text-center hover:opacity-80'
              onClick={() => openModal('following')}
            >
              <p className='text-xl font-bold'>{user.followingCount}</p>
              <p className='text-gray-400 text-sm'>Following</p>
            </div>

            {modalType === 'followers' && (
              <UserListModal
                title='Followers'
                users={user.followerList}
                onClose={closeModal}
              />
            )}
            {modalType === 'following' && (
              <UserListModal
                title='Following'
                users={user.followingList}
                onClose={closeModal}
              />
            )}
          </div>

        </div>

        <div>
          {loggedInUser?.username === username && (
            <button
              onClick={() => {
                setEditProfileData({ username: user.username, name: user.name })
                toggleEditProfileModal()
              }}
              className='ml-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 focus:outline-none sm:ml-0 sm:mt-4 mb-4'
            >
              <Edit3 size={24} />
            </button>
          )}
          {loggedInUser && loggedInUser.username !== username && (
            <button
              onClick={followUnfollow}
              className={`ml-4 p-2 px-10 text-base md:px-20 md:text-xl mb-4 ${isFollowing
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
                } rounded-full focus:outline-none sm:ml-0 sm:mt-4 text-white`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
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

      {/* Search Input */}
      <Search filterText={filterText} setFilterText={setFilterText} />

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
                      image={profilePic}
                      username={user.username}
                    />
                    )
                  : (
                    <OtherProfileNoteItem
                      key={note._id}
                      noteId={note._id}
                      title={note.title}
                      description={note.description}
                      date={note.date}
                      modifiedDate={note.modifiedDate}
                      tag={note.tag}
                      showAlert={showAlert}
                      image={profilePic}
                      username={user.username}
                      note={note}
                    />
                    )
              )
            )
          : (
            <p className='text-center text-gray-400 w-full'>No notes available.</p>
            )}
      </div>

      {/* Add Note Button */}
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
