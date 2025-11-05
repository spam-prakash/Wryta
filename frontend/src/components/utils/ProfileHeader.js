import React, { useState } from 'react'
import { CameraIcon, Edit3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import renderWithLinksAndMentions from '../utils/renderWithLinksAndMentions'
import UserListModal from '../models/UserListModal'

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
          <div className='left relative'>
            <div className='img'>

              <button
                type='button'
                onClick={() => setIsLightboxOpen(true)}
                className='focus:outline-none'
                aria-label='Open full image'
              >
                <img
                  className='w-28 h-28 md:w-40 md:h-40 object-cover rounded-full border-2 border-gray-400'
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
                  className='absolute bottom-8 right-6 md:bottom-12 md:right-0 w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md border'
                  aria-label='Upload profile picture'
                >
                  <CameraIcon className='w-4 h-4' />
                </button>
              )}
            </div>
            <div className='name flex justify-center items-center font-medium text-xl'>
              {name}
            </div>
          </div>

          <div className='right flex-grow'>
            <div className='flex flex-col space-y-4 md:space-y-9'>
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
