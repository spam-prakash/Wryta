import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useContext, useRef, useCallback } from 'react'
import OtherProfileNoteItem from './NoteItems/OtherProfileNoteItem'
import noteContext from '../context/notes/NoteContext'
import OwnNoteItem from './NoteItems/OwnNoteItem'
import NoteUpdateModal from './NoteUpdateModal'
import Addnote from './Addnote'
import { Plus, Edit3, CameraIcon } from 'lucide-react'
import Search from './Search'
import UserListModal from './utils/UserListModal'
import Loader from './utils/Loader'

const OthersProfile = ({ loggedInUser, showAlert }) => {
  const { notes, getNotes, editNote } = useContext(noteContext)
  const [modalType, setModalType] = useState(null)
  const { username: initialUsername } = useParams()
  const [username, setUsername] = useState(initialUsername)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [sortCriteria, setSortCriteria] = useState('modifiedDate')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isEditProfileModelOpen, setIsEditProfileModelOpen] = useState(false)
  const [isUserListModal, setIsUserListModalOpen] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isNoteAddModelOpen, setIsNoteAddModelOpen] = useState(false)
  const [isUpdateNoteModalOpen, setIsUpdateNoteModalOpen] = useState(false)
  const addNoteModalRef = useRef(null)
  const updateNoteModalRef = useRef(null)
  const [filterText, setFilterText] = useState('')
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [currentNote, setCurrentNote] = useState(null)
  const [editProfileData, setEditProfileData] = useState({
    username: '',
    name: ''
  })

  const hostLink = process.env.REACT_APP_HOSTLINK
  const imageAPI = process.env.REACT_APP_IMAGEAPI
  const navigate = useNavigate()

  // Memoize modal functions
  const openModal = useCallback((type) => setModalType(type), [])
  const closeModal = useCallback(() => {
    setModalType(null)
    setIsUserListModalOpen(false)
  }, [])

  // Handle token check
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      navigate('/login')
      return
    }

    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      localStorage.setItem('token', token)
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
      navigate('/')
    }
  }, [navigate])

  // Handle body scroll lock for modals
  useEffect(() => {
    const isAnyModalOpen =
      isEditProfileModelOpen ||
      isUserListModal ||
      isNoteAddModelOpen ||
      isUpdateNoteModalOpen ||
      isLightboxOpen

    document.body.style.overflow = isAnyModalOpen ? 'hidden' : 'auto'

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isEditProfileModelOpen, isUserListModal, isNoteAddModelOpen, isUpdateNoteModalOpen, isLightboxOpen])

  // Close lightbox on Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isLightboxOpen])

  const toggleAddNoteModal = () => {
    if (addNoteModalRef.current) {
      addNoteModalRef.current.classList.toggle('hidden')
      setIsNoteAddModelOpen(!addNoteModalRef.current.classList.contains('hidden'))
    }
  }

  const toggleEditProfileModal = useCallback(() => {
    setIsEditProfileModelOpen((prev) => {
      if (!prev && user) {
        setEditProfileData({ username: user.username || '', name: user.name || '' })
      }
      return !prev
    })
  }, [user])

  const toggleUpdateNoteModal = () => {
    if (updateNoteModalRef.current) {
      updateNoteModalRef.current.classList.toggle('hidden')
      setIsUpdateNoteModalOpen(!updateNoteModalRef.current.classList.contains('hidden'))
    }
  }

  const fetchUserProfile = useCallback(async (username) => {
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
      setIsFollowing(data.isFollowing || false)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setError('Something went wrong while loading the user profile.')
    }
  }, [hostLink])

  // Fetch user profile when username changes
  useEffect(() => {
    if (username) {
      fetchUserProfile(username)
      // Reset modal states when username changes
      setIsEditProfileModelOpen(false)
      setIsUserListModalOpen(false)
      setModalType(null)
      setCurrentNote(null)
    }
  }, [username, fetchUserProfile])

  // Update username from params
  useEffect(() => {
    setUsername(initialUsername)
  }, [initialUsername])

  // Check if viewing own profile and fetch notes
  useEffect(() => {
    const isOwn = loggedInUser?.username === username
    setIsOwnProfile(isOwn)
    if (isOwn && getNotes) {
      getNotes()
    }
  }, [username, loggedInUser?.username, getNotes])

  // Update document title
  useEffect(() => {
    if (user) {
      document.title = `${username} || Wryta`
    }
  }, [user, username])

  const updateNote = (note) => {
    setCurrentNote(note)
    toggleUpdateNoteModal()
  }

  const handleEditProfileChange = useCallback((e) => {
    setEditProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }, [])

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault()
    const updatedData = {
      username: editProfileData.username || user.username,
      name: editProfileData.name || user.name
    }

    try {
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
        }
        showAlert('Profile updated successfully', '#D4EDDA')
      } else {
        const errorMsg =
        json.errors?.[0]?.msg || // express-validator error
        json.error || // custom backend error
        'Something went wrong'
        showAlert(errorMsg, '#F8D7DA')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showAlert(error.msg, '#F8D7DA')
    }
  }

  const followUnfollow = async () => {
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow'
      await fetch(`${hostLink}/api/user/${endpoint}/${user.id}`, {
        method: 'POST',
        headers: {
          'auth-token': localStorage.getItem('token')
        }
      })
      setIsFollowing(!isFollowing)
      fetchUserProfile(username)
    } catch (error) {
      console.error('Error updating follow status:', error)
      showAlert('Failed to update follow status', '#F8D7DA')
    }
  }

  // Error screen
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

  // Loading screen
  if (!user) {
    return <Loader />
  }

  const profilePic = user.profilePic || `${imageAPI}${encodeURIComponent(username)}`
  const notesToDisplay = isOwnProfile ? notes : user.publicNotes || []

  const filteredNotes = notesToDisplay.filter((note) =>
    note.title.toLowerCase().includes(filterText.toLowerCase()) ||
    note.description.toLowerCase().includes(filterText.toLowerCase()) ||
    note.tag.toLowerCase().includes(filterText.toLowerCase())
  )

  const sortedNotesToDisplay = [...filteredNotes].sort((a, b) => {
    const dateA = new Date(a[sortCriteria] || a.date)
    const dateB = new Date(b[sortCriteria] || b.date)
    return sortOrder === 'old' ? dateA - dateB : dateB - dateA
  })

  const categories = {
    '✨ All': [],
    '📚 General': ['General', 'Note', 'Task', 'Ideas'],
    '📂 Work': ['Meetings', 'Projects', 'Work'],
    '🏡 Personal': ['Reading', 'Poem', 'Shayari', 'Thought'],
    '💰 Future': ['Budgeting', 'Future Plans', 'Goals']
  }

  return (
    <>
      <Search
        filterText={filterText}
        setFilterText={setFilterText}
        className='fixed left-0 w-full bg-gray-900 z-40 px-4 shadow-md'
      />

      <Addnote
        modalRef={addNoteModalRef}
        showAlert={showAlert}
        toggleModal={toggleAddNoteModal}
        isOpen={isNoteAddModelOpen}
      />

      <NoteUpdateModal
        modalRef={updateNoteModalRef}
        currentNote={currentNote}
        categories={categories}
        editNote={editNote}
        showAlert={showAlert}
        toggleModal={toggleUpdateNoteModal}
        isOpen={isUpdateNoteModalOpen}
      />

      {/* Profile picture action modal (only for own profile) */}
      {isLightboxOpen && (
        <div
          className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50'
          onClick={() => setIsLightboxOpen(false)}
        >
          <img
            src={profilePic}
            alt='Full screen'
            className='w-60 h-60 md:w-96 md:h-96 object-cover rounded-2xl '
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {isEditProfileModelOpen && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 p-4 sm:p-0'>
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
                  className='mt-1 block w-full rounded-md border-gray-600 bg-[#374151] text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2'
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
                  className='mt-1 block w-full rounded-md border-gray-600 bg-[#374151] text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2'
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
      )}

      <div className='flex flex-col items-center text-white px-4'>
        <div className='flex flex-col md:flex-row items-center w-full max-w-4xl py-6 mt-28'>
          <div className='relative'>
            <button
              type='button'
              onClick={() => setIsLightboxOpen(true)}
              className='focus:outline-none'
              aria-label='Open full image'
            >
              <img
                className='size-40 object-cover rounded-full border-4 border-gray-400'
                src={profilePic}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = `${imageAPI}${encodeURIComponent(username)}`
                }}
                alt='Profile'
              />
            </button>

            {isOwnProfile && (
              <button
                type='button'
                onClick={() => navigate('/upload-image')}
                className='absolute right-2 bottom-2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md border'
                aria-label='Upload profile picture'
              >
                <CameraIcon />
              </button>
            )}
          </div>
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
              onClick={() => {
                openModal('followers')
                setIsUserListModalOpen(true)
              }}
            >
              <p className='text-xl font-bold'>{user.followerCount}</p>
              <p className='text-gray-400 text-sm'>Followers</p>
            </div>
            <div
              className='cursor-pointer text-center hover:opacity-80'
              onClick={() => {
                openModal('following')
                setIsUserListModalOpen(true)
              }}
            >
              <p className='text-xl font-bold'>{user.followingCount}</p>
              <p className='text-gray-400 text-sm'>Following</p>
            </div>
          </div>
        </div>

        <div>
          {isOwnProfile
            ? (
              <button
                onClick={toggleEditProfileModal}
                className='ml-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 focus:outline-none sm:ml-0 sm:mt-4 mb-4'
              >
                <Edit3 size={24} />
              </button>
              )
            : loggedInUser && (
              <button
                onClick={followUnfollow}
                className={`ml-4 p-2 px-10 text-base md:px-20 md:text-xl mb-4 ${
                isFollowing
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } rounded-full focus:outline-none sm:ml-0 sm:mt-4 text-white`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
        </div>
      </div>

      <div className='flex gap-2 mb-3 px-4'>
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

      <div className='w-full flex flex-wrap text-white gap-3 mt-4 px-4'>
        {sortedNotesToDisplay.length > 0
          ? (
              sortedNotesToDisplay.map((note) =>
                isOwnProfile
                  ? (
                    <OwnNoteItem
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

      {loggedInUser && (
        <button
          onClick={toggleAddNoteModal}
          className='fixed bottom-10 right-10 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 focus:outline-none'
        >
          <Plus size={50} />
        </button>
      )}

      {modalType === 'followers' && isUserListModal && (
        <UserListModal
          title='Followers'
          users={user.followerList || []}
          onClose={closeModal}
          isOpen={isUserListModal}
        />
      )}
      {modalType === 'following' && isUserListModal && (
        <UserListModal
          title='Following'
          users={user.followingList || []}
          onClose={closeModal}
          isOpen={isUserListModal}
        />
      )}
    </>
  )
}

export default OthersProfile
