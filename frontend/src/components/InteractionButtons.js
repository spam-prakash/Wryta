import { useState, useEffect } from 'react'
import { Heart, Copy, Download, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import UserListModal from './utils/UserListModal'

const InteractionButtons = ({ title, tag, description, showAlert, cardRef, noteId, note }) => {
  const [modalType, setModalType] = useState(null)
  const [likingUsers, setLikingUsers] = useState([])
  const [liked, setLiked] = useState(false)
  const [isUserListModelOpen, setIsUserListModalOpen] = useState(false)
  const [counts, setCounts] = useState({ likes: 0, copies: 0, downloads: 0, shares: 0 })
  const hostLink = process.env.REACT_APP_HOSTLINK

  // Fetch counts
  const fetchCounts = async () => {
    try {
      const response = await fetch(`${hostLink}/api/notes/note/${noteId}/counts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCounts(data)
      }
    } catch (error) {
      console.error('Error fetching counts:', error)
    }
  }

  // Fetch liking users
  const fetchLikingUsers = async () => {
    try {
      const response = await fetch(`${hostLink}/api/notes/note/${noteId}/likedetails`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        }
      })
      if (response.ok) {
        const data = await response.json()
        setLikingUsers(data)
        // console.log(likingUsers.users)
        setModalType('likes') // open modal
      }
    } catch (error) {
      console.error('Error fetching liking users:', error)
    }
  }

  // Fetch liked notes to check if current note is liked
  const fetchLikedNotes = async () => {
    try {
      const response = await fetch(`${hostLink}/api/user/useraction/likednotes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        }
      })
      if (response.ok) {
        const likedNotes = await response.json()
        setLiked(likedNotes.some((note) => note._id === noteId))
      }
    } catch (error) {
      console.error('Error fetching liked notes:', error)
    }
  }

  useEffect(() => {
    fetchLikedNotes()
    // fetchCounts() // optional if note already contains live counts
  }, [noteId, hostLink])

  const updateCount = async (action) => {
    try {
      const response = await fetch(`${hostLink}/api/notes/note/${noteId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        }
      })
      if (response.ok) fetchCounts()
    } catch (error) {
      console.error(`Error updating ${action} count:`, error)
    }
  }

  const handleLike = async () => {
    try {
      const response = await fetch(`${hostLink}/api/notes/note/${noteId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        }
      })
      if (response.ok) {
        const result = await response.json()
        setLiked(result.message === 'Note liked')
        fetchCounts()
      }
    } catch (error) {
      console.error('Error liking/unliking note:', error)
    }
  }

  const copyToClipboard = () => {
    const textToCopy = `Title: ${note.title}\nTag: ${note.tag}\n\nDescription:\n${note.description}`
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showAlert('Note successfully copied!', '#D4EDDA')
        updateCount('copy')
      })
      .catch(() => showAlert('Failed to copy note.', '#F8D7DA'))
  }

  const downloadCardAsImage = async () => {
    try {
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          useCORS: true,
          backgroundColor: '#0a1122',
          scale: 2
        })
        const dataURL = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = dataURL
        link.download = `${note.title || 'note'}.png`
        link.click()
        showAlert('Card downloaded successfully!', '#D4EDDA')
        updateCount('download')
      }
    } catch (error) {
      console.error('Error downloading card:', error)
      showAlert('Failed to download card. Please try again.', '#F8D7DA')
    }
  }

  const shareNote = async () => {
    const shareUrl = `${window.location.origin}/note/${noteId}`
    await navigator.clipboard.writeText(shareUrl)
    showAlert('Note link copied to clipboard!', '#D4EDDA')

    try {
      if (navigator.share) {
        await navigator.share({
          title: note.title || 'Shared Note',
          text: `Check out this note: ${note.title}`,
          url: shareUrl
        })
      }

      const response = await fetch(`${hostLink}/api/notes/note/${noteId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        }
      })
      if (response.ok) fetchCounts()
    } catch (error) {
      console.error('Error sharing:', error)
      showAlert('Failed to share note. Please try again.', '#F8D7DA')
    }
  }

  return (
    <>
      <div className='flex items-center justify-between px-4 py-2 border-t border-gray-700'>
        {/* Like Button */}
        <button className='flex items-center space-x-2'>
          <Heart onClick={handleLike} color={liked ? '#FF0000' : '#FFFFFF'} fill={liked ? '#FF0000' : 'none'} />
          <span
            onClick={() => {
              fetchLikingUsers() // ✅ call the function
              setIsUserListModalOpen(true)
            }} className='text-sm text-gray-400 cursor-pointer hover:underline'
          >
            {counts.likes || note.likes} {(counts.likes || note.likes) > 1 ? 'Likes' : 'Like'}
          </span>
        </button>

        {/* Copy Button */}
        <button onClick={copyToClipboard} className='flex items-center space-x-2'>
          <Copy />
          <span className='text-sm text-gray-400'>{counts.copies || note.copies}</span>
        </button>

        {/* Download Button */}
        <button onClick={downloadCardAsImage} className='flex items-center space-x-2'>
          <Download />
          <span className='text-sm text-gray-400'>{counts.downloads || note.downloads}</span>
        </button>

        {/* Share Button */}
        <button onClick={shareNote} className='flex items-center space-x-2'>
          <Share2 />
          <span className='text-sm text-gray-400'>{counts.shares || note.shares}</span>
        </button>
      </div>

      {/* Modal Rendering */}
      {modalType === 'likes' && (
        <UserListModal
          title='Likes'
          users={likingUsers.users}
          onClose={() => setModalType(null)}
          isOpen={isUserListModelOpen}
        />
      )}
    </>
  )
}

export default InteractionButtons
