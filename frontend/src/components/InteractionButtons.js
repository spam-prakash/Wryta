import { useState, useEffect } from 'react'
import { Heart, Copy, Download, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'

const InteractionButtons = ({ title, tag, description, showAlert, cardRef, noteId, note }) => {
  // console.log(note)
  const [liked, setLiked] = useState(false)
  const [counts, setCounts] = useState({ likes: 0, copies: 0, downloads: 0, shares: 0 })
  const hostLink = process.env.REACT_APP_HOSTLINK

  // Fetch counts and liked notes
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
      } else {
        console.error('Failed to fetch counts')
      }
    } catch (error) {
      console.error('Error fetching counts:', error)
    }
  }

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
        setLiked(likedNotes.some((note) => note._id === noteId)) // Check if the current note is liked
      } else {
        console.error('Failed to fetch liked notes')
      }
    } catch (error) {
      console.error('Error fetching liked notes:', error)
    }
  }

  useEffect(() => {
    fetchLikedNotes() // Fetch liked notes to set the `liked` state
    // fetchCounts() // Fetch counts for the note
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
      if (response.ok) {
        fetchCounts() // Refresh counts after the action
      } else {
        throw new Error('Failed to update count')
      }
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
        fetchCounts() // Refresh counts after liking/unliking
      } else {
        console.error('Failed to like/unlike note')
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
        updateCount('copy') // Update the copy count
      })
      .catch(() => showAlert('Failed to copy note.', '#F8D7DA'))
  }

  const downloadCardAsImage = async () => {
    try {
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          useCORS: true,
          backgroundColor: '#0a1122', // Match your card's background
          scale: 2
        })
        const dataURL = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = dataURL
        link.download = `${note.title || 'note'}.png`
        link.click()
        showAlert('Card downloaded successfully!', '#D4EDDA')
        updateCount('download') // Update the download count
      } else {
        showAlert('Card reference is not available!', '#F8D7DA')
      }
    } catch (error) {
      console.error('Error downloading card as image:', error)
      showAlert('Failed to download card. Please try again.', '#F8D7DA')
    }
  }

  const shareNote = async () => {
    const shareUrl = `${window.location.origin}/note/${noteId}`
    showAlert('Note link copied to clipboard!', '#D4EDDA')

    try {
      await navigator.clipboard.writeText(shareUrl)
      console.log('Note link copied to clipboard!')

      if (navigator.share) {
        await navigator.share({
          title: note.title || 'Shared Note',
          text: `Check out this note: ${note.title}`,
          url: shareUrl
        })
      } else {
        showAlert('Your browser does not support the Web Share API.')
      }
      // Call the backend to update the share count and user's shared notes
      const response = await fetch(`${hostLink}/api/notes/note/${noteId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        }
      })
      if (response.ok) {
        fetchCounts() // Refresh counts after the action
      } else {
        throw new Error('Failed to update share count')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      showAlert('Failed to share note. Please try again.', '#F8D7DA')
    }
  }

  return (
    <div className='flex items-center justify-between px-4 py-2 bottom-0 border-t border-gray-700'>
      {/* Like Button */}
      <button onClick={handleLike} className='flex items-center space-x-2'>
        <Heart color={liked ? '#FF0000' : '#FFFFFF'} fill={liked ? '#FF0000' : 'none'} />
        <span className='text-sm text-gray-400'>{counts.likes || note.likes}</span>
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
  )
}

export default InteractionButtons
