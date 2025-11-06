import React, { useState } from 'react'
import { CameraIcon, Edit3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import renderWithLinksAndMentions from './utils/renderWithLinksAndMentions'
import UserListModal from './models/UserListModal'

const ProfileHeader = ({
  username,
  name,
  bio,
  followerCount,
  followingCount,
  totalNotes,
  publicNotesCount,
  profilePic,
  isOwnProfile,
  loggedInUser,
  userId,
  showAlert,
  setIsEditProfileModelOpen,
  isFollowing,
  onFollowToggle,
  showPublicOnly, // boolean - owner only
  onTogglePublic, // function - owner only
  followerList,
  followingList
}) => {
  const imageAPI = process.env.REACT_APP_IMAGEAPI
  const navigate = useNavigate()

  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [isUserListModal, setIsUserListModalOpen] = useState(false)

  // Close modals when clicking outside
  const handleModalClose = () => {
    setModalType(null)
    setIsUserListModalOpen(false)
  }

  return (
    <>
      <div className='flex flex-col text-white px-4  mx-auto pt-44 mb-10 max-w-2xl'>
        <div className='flex items-center space-x-8 mb-4'>
          <div className='left relative flex flex-col items-center'>
            <div className='relative'>
              <button
                type='button'
                onClick={() => setIsLightboxOpen(true)}
                className='focus:outline-none'
                aria-label='Open full image'
              >
                <div
                  className='relative overflow-hidden rounded-full border-2 border-gray-400'
                  style={{
    width: 'clamp(80px, 24vw, 160px)',
    height: 'clamp(80px, 24vw, 160px)'
  }}
                >
                  <img
    src={profilePic}
    alt={username}
    className='w-full h-full object-cover'
    onError={(e) => {
      e.target.onerror = null
      e.target.src = `${imageAPI}${encodeURIComponent(username)}`
    }}
  />
                                </div>

              </button>

              {isOwnProfile && (
                <button
                  type='button'
                  onClick={() => navigate('/upload-image')}
                  // size is relative to viewport width but clamped between 32px and 40px
                  style={{ width: 'clamp(32px, 6vw, 36px)', height: 'clamp(32px, 6vw, 36px)' }}
                  className='absolute bottom-1 right-1 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md border border-gray-400 hover:scale-105 transition-transform'
                  aria-label='Upload profile picture'
                >
                  <CameraIcon style={{ width: 'clamp(16px, 3.5vw, 24px)', height: 'clamp(16px, 3.5vw, 24px)' }} className='text-gray-700 dark:text-gray-200' />
                </button>
              )}
            </div>

            <div className='name mt-2 md:mt-0 text-center md:text-left font-medium text-xl'>
              {name}
            </div>
          </div>

          <div className='right flex-grow'>
            <div className='flex flex-col space-y-4 md:space-y-9 w-full md:w-auto'>
              <div className='flex justify-center items-center space-x-4'>
                <h2 className='text-xl font-normal'>{username}</h2>
              </div>

              <div className='flex justify-center items-center flex-wrap gap-y-2 md:flex-nowrap md:space-x-12 '>
                <div className='w-1/2 md:w-auto text-center flex flex-col'>
                  <span className='font-semibold'>{totalNotes}</span>
                  <span className='text-sm text-gray-300 ml-1'>notes</span>
                </div>
                <div className='w-1/2 md:w-auto text-center flex flex-col'>
                  <span className='font-semibold'>{publicNotesCount}</span>
                  <span className='text-sm text-gray-300 ml-1'>public</span>
                </div>
                <div
                  className='w-1/2 md:w-auto text-center cursor-pointer flex flex-col'
                  onClick={() => {
                    setModalType('followers')
                    setIsUserListModalOpen(true)
                  }}
                >
                  <span className='font-semibold'>{followerCount}</span>
                  <span className='text-sm text-gray-300 ml-1'>followers</span>
                </div>
                <div
                  className='w-1/2 md:w-auto text-center cursor-pointer flex flex-col'
                  onClick={() => {
                    setModalType('following')
                    setIsUserListModalOpen(true)
                  }}
                >
                  <span className='font-semibold'>{followingCount}</span>
                  <span className='text-sm text-gray-300 ml-1'>following</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className='bio mb-4'>
          {bio && (
            <div className='text-sm'>
              <p className='whitespace-pre-wrap'>{renderWithLinksAndMentions(bio)}</p>
            </div>
          )}
        </div>
        <div className='actionBtn w-full flex flex-col items-center'>
          {isOwnProfile ? (
            <>
              <button
                onClick={() => setIsEditProfileModelOpen(true)}
                className='w-full px-8 py-1.5 bg-gray-800 hover:bg-gray-700 text-sm flex items-center justify-center space-x-2 rounded-full shadow-sm transition-transform duration-150'
              >
                <span>Edit profile</span>
                <Edit3 size={16} />
              </button>

              {/* Owner-only filter button: small, centered under edit */}
              {typeof onTogglePublic === 'function' && (
                <button
                  onClick={onTogglePublic}
                  className={`mt-3 px-4 py-1 rounded-full text-sm font-medium focus:outline-none transition-colors ${showPublicOnly ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                >
                  {showPublicOnly ? 'Showing: Public' : 'Showing: All'}
                </button>
              )}
            </>
          ) : (
            loggedInUser && (
              <button
                onClick={onFollowToggle}
                className={`w-full px-8 py-1.5 rounded-full ${
                isFollowing
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-base font-medium focus:outline-none transition-colors shadow-sm`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Lightbox modal */}
      {isLightboxOpen && (
        <div
          className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50'
          onClick={() => setIsLightboxOpen(false)}
        >
          <img
            src={profilePic}
            alt='Full screen'
            className='w-60 h-60 md:w-96 md:h-96 object-cover rounded-2xl'
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Followers/Following modals */}
      {modalType === 'followers' && isUserListModal && (
        <UserListModal
          title='Followers'
          users={followerList || []}
          onClose={handleModalClose}
          isOpen={isUserListModal}
        />
      )}
      {modalType === 'following' && isUserListModal && (
        <UserListModal
          title='Following'
          users={followingList || []}
          onClose={handleModalClose}
          isOpen={isUserListModal}
        />
      )}
    </>
  )
}

export default ProfileHeader
