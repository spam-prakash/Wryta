import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useContext, useCallback, useRef } from 'react'
import noteContext from '../context/notes/NoteContext'
import Search from './Search'
import EditProfileModel from './models/EditProfileModel'
import NoteUpdateModal from './models/NoteUpdateModal'
import Loader from './utils/Loader'
import ProfileHeader from './ProfileHeader'
import OwnNoteItem from './NoteItems/OwnNoteItem'
import OtherProfileNoteItem from './NoteItems/OtherProfileNoteItem'
import UserListModal from './models/UserListModal'
import Addnote from './Addnote'
import { Plus } from 'lucide-react'

const OthersProfile = ({ loggedInUser, showAlert, isAuthenticated }) => {
  const { notes, getNotes, editNote } = useContext(noteContext)
  const { username: initialUsername } = useParams()
  const [username, setUsername] = useState(initialUsername)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [sortCriteria, setSortCriteria] = useState('modifiedDate')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isEditProfileModelOpen, setIsEditProfileModelOpen] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [isUserListModal, setIsUserListModal] = useState(false)
  const [isUpdateNoteModalOpen, setIsUpdateNoteModalOpen] = useState(false)
  const [currentNoteForUpdate, setCurrentNoteForUpdate] = useState(null)
  const addNoteModalRef = useRef(null)
  const [isNoteAddModelOpen, setisNoteAddModelOpen] = useState(false)

  const hostLink = process.env.REACT_APP_HOSTLINK
  const imageAPI = process.env.REACT_APP_IMAGEAPI
  const navigate = useNavigate()

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

  // Handle body scroll for edit profile modal
  useEffect(() => {
    document.body.style.overflow = isEditProfileModelOpen ? 'hidden' : 'auto'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isEditProfileModelOpen])

  // Fetch user profile
  const fetchUserProfile = useCallback(async (username) => {
    try {
      const response = await fetch(`${hostLink}/api/user/${username}`, {
        headers: {
          'auth-token': localStorage.getItem('token')
        }
      })

      if (!response.ok) {
        setError(response.status === 404 ? 'User not found.' : 'Failed to load user profile.')
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
  }, [hostLink, setUser, setIsFollowing])

  // Load profile data when username changes
  useEffect(() => {
    if (username) {
      fetchUserProfile(username)
      setIsEditProfileModelOpen(false)
    }
  }, [username, fetchUserProfile])

  // Update username from params
  useEffect(() => {
    setUsername(initialUsername)
  }, [initialUsername])

  // Check if viewing own profile
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

  const handleEditProfileSubmit = async (e) => {
    try {
      const response = await fetch(`${hostLink}/api/auth/updateprofile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(e)
      })
      const json = await response.json()

      if (json.success) {
        if (e.username !== user.username) {
          setUsername(e.username)
          navigate(`/u/${e.username}`)
          window.location.reload()
        } else {
          await fetchUserProfile(username)
          toggleEditProfileModal()
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

  const toggleAddNoteModal = () => {
    if (addNoteModalRef.current) {
      addNoteModalRef.current.classList.toggle('hidden')
      setisNoteAddModelOpen(!isNoteAddModelOpen)
    }
  }

  // Error screen
  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
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
    const getRelevantDate = (note) => {
      if (sortCriteria === 'modifiedDate') {
      // Sort by publicDate → fallback to modifiedDate → createdDate
        return new Date(note.publicDate || note.modifiedDate || note.date)
      } else if (sortCriteria === 'date') {
      // Sort by createdDate → fallback to modifiedDate
        return new Date(note.date || note.modifiedDate)
      } else {
      // Default fallback
        return new Date(note.publicDate || note.modifiedDate || note.date)
      }
    }

    const dateA = getRelevantDate(a)
    const dateB = getRelevantDate(b)

    return sortOrder === 'old' ? dateA - dateB : dateB - dateA
  })

  const closeModal = () => {
    setModalType(null)
    setIsUserListModal(false)
  }

  const toggleEditProfileModal = () => {
    setIsEditProfileModelOpen(prev => !prev)
  }

  const toggleUpdateNoteModal = () => {
    setIsUpdateNoteModalOpen(prev => !prev)
  }

  const updateNote = (note) => {
    setCurrentNoteForUpdate(note)
    setIsUpdateNoteModalOpen(true)
  }
  // console.log("Stored",sortedNotesToDisplay)
  return (
    <div className='min-h-screen'>
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

      {isEditProfileModelOpen && (
        <EditProfileModel
          isOpen={isEditProfileModelOpen}
          initialData={{
            username: user.username,
            name: user.name,
            bio: user.bio
          }}
          onSubmit={handleEditProfileSubmit}
          onClose={() => setIsEditProfileModelOpen(false)}
        />
      )}

      {/* Note update modal (owner only) */}
      <NoteUpdateModal
        currentNote={currentNoteForUpdate}
        editNote={editNote}
        showAlert={showAlert}
        toggleModal={toggleUpdateNoteModal}
        isOpen={isUpdateNoteModalOpen}
      />

      <ProfileHeader
        username={username}
        profilePic={profilePic}
        isOwnProfile={isOwnProfile}
        name={user.name}
        bio={user.bio}
        totalNotes={user.totalNotes}
        publicNotesCount={user.publicNotesCount}
        followerCount={user.followerCount}
        followingCount={user.followingCount}
        loggedInUser={loggedInUser}
        userId={user.id}
        isFollowing={isFollowing}
        setIsEditProfileModelOpen={setIsEditProfileModelOpen}
        onFollowToggle={followUnfollow}
        showAlert={showAlert}
        followerList={user.followerList}
        followingList={user.followingList}
      />

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
                      showAlert={showAlert}
                      updateNote={updateNote}
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
                      publicDate={note.publicDate}
                      tag={note.tag}
                      note={note}
                      username={user.username}
                      image={profilePic}
                      showAlert={showAlert}
                    />
                    )
              )
            )
          : (
            <p className='text-center text-gray-400 w-full'>No notes available.</p>
            )}
      </div>

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

      {isAuthenticated && (
        <button
          onClick={toggleAddNoteModal}
          className='fixed bottom-10 right-10 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 focus:outline-none'
        >
          <Plus size={50} />
        </button>
      )}
    </div>
  )
}

export default OthersProfile
