import { useState, useEffect } from 'react'
import { Heart, Copy, Download, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import UserListModal from './models/UserListModal'

const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const [, payload] = token.split('.')
    return JSON.parse(atob(payload)).user.id
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

const InteractionButtons = ({ title, tag, description, showAlert, cardRef, noteId, note, ownerName }) => {
  // console.log(note.userDetails.username)
  const [modalType, setModalType] = useState(null)
  const [likingUsers, setLikingUsers] = useState([])
  const [liked, setLiked] = useState(false)
  const [isUserListModelOpen, setIsUserListModalOpen] = useState(false)
  const [counts, setCounts] = useState({
    likes: note.likes || 0,
    copies: note.copies || 0,
    downloads: note.downloads || 0,
    shares: note.shares || 0
  })

  const hostLink = process.env.REACT_APP_HOSTLINK
  const userId = getUserIdFromToken()

  // ✅ Determine liked status on mount or when note changes
  useEffect(() => {
    if (!note) return

    // handle both profile and public structures
    const likesArray = note.actions?.likes || []
    const isLiked = Array.isArray(likesArray) && likesArray.includes(userId)
    setLiked(isLiked)

    // initialize counts if available in note
    setCounts({
      likes: note.actions?.likes?.length ?? 0,
      copies: note.copies ?? note.actions?.copies ?? 0,
      downloads: note.downloads ?? note.actions?.downloads ?? 0,
      shares: note.shares ?? note.actions?.shares ?? 0
    })
  }, [note, userId])

  // ✅ Re-fetch live counts when noteId changes
  // useEffect(() => {
  //   if (noteId) fetchCounts()
  // }, [noteId])

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
        setModalType('likes')
      }
    } catch (error) {
      console.error('Error fetching liking users:', error)
    }
  }

  // ✅ Like/Unlike (instant update + backend sync)
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
        const isLikedNow = result.message === 'Note liked'

        // instant feedback
        setLiked(isLikedNow)
        setCounts(prev => ({
          ...prev,
          likes: prev.likes + (isLikedNow ? 1 : -1)
        }))
      }
    } catch (error) {
      console.error('Error liking/unliking note:', error)
    }
  }

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
    const shareText = `Check out this note: "${note.title}" by @${ownerName}\n\n${shareUrl}`

    // Always copy the full text to clipboard (works even if share dialog doesn't)
    await navigator.clipboard.writeText(shareUrl)
    showAlert('Note link copied to clipboard!', '#D4EDDA')

    try {
      if (navigator.share) {
        console.log('Sharing as:', ownerName)
        await navigator.share({
          title: `Note by @${ownerName}`,
          text: `Check out this note: "${note.title}" by @${ownerName}\n Link: `,
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
        {/* ❤️ Like Button */}
        <button className='flex items-center space-x-2'>
          <Heart
            onClick={handleLike}
            color={liked ? '#FF0000' : '#FFFFFF'}
            fill={liked ? '#FF0000' : 'none'}
          />
          <span
            onClick={() => {
              fetchLikingUsers()
              setIsUserListModalOpen(true)
            }}
            className='text-sm text-gray-400 cursor-pointer hover:underline'
          >
            {counts.likes} {counts.likes === 1 ? 'Like' : 'Likes'}
          </span>
        </button>

        {/* 📋 Copy */}
        <button onClick={copyToClipboard} className='flex items-center space-x-2'>
          <Copy />
          <span className='text-sm text-gray-400'>{counts.copies}</span>
        </button>

        {/* ⬇️ Download */}
        <button onClick={downloadCardAsImage} className='flex items-center space-x-2'>
          <Download />
          <span className='text-sm text-gray-400'>{counts.downloads}</span>
        </button>

        {/* 🔗 Share */}
        <button onClick={shareNote} className='flex items-center space-x-2'>
          <Share2 />
          <span className='text-sm text-gray-400'>{counts.shares}</span>
        </button>
      </div>

      {/* 🧑‍🤝‍🧑 Likes Modal */}
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
