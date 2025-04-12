import { useState } from 'react'
import { Heart, Copy, Download, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'

const InteractionButtons = ({ title, tag, description, showAlert, cardRef, noteId }) => {
  const [liked, setLiked] = useState(false)

  const copyToClipboard = () => {
    const textToCopy = `Title: ${title}\nTag: ${tag}\n\nDescription:\n${description}`
    navigator.clipboard.writeText(textToCopy)
    showAlert('Note successfully copied!', '#D4EDDA')
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
        link.download = `${title || 'note'}.png`
        link.click()
        showAlert('Card downloaded successfully!', '#D4EDDA')
      } else {
        showAlert('Card reference is not available!', '#F8D7DA')
      }
    } catch (error) {
      console.error('Error downloading card as image:', error)
      showAlert('Failed to download card. Please try again.', '#F8D7DA')
    }
  }

  const shareNote = async () => {
    if (!navigator.share) {
      showAlert('Your browser does not support the Web Share API.')
      return
    }

    try {
      await navigator.share({
        url: window.location.href
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <div className='flex items-center justify-between px-4 py-2 bottom-0 border-t border-gray-700'>
      {/* Like Button */}
      <button onClick={() => setLiked(!liked)} className='flex items-center space-x-2'>
        {liked ? <Heart className='text-red-500 fill-red-500' /> : <Heart />}
        <span className='text-sm'>{liked ? 'Liked' : 'Like'}</span>
      </button>

      {/* Download Button */}
      <button onClick={downloadCardAsImage} className='flex items-center space-x-2'>
        <Download />
        <span className='text-sm'>Download</span>
      </button>

      {/* Copy Button */}
      <button onClick={copyToClipboard} className='flex items-center space-x-2'>
        <Copy />
        <span className='text-sm'>Copy</span>
      </button>

      {/* Share Button */}
      <button onClick={shareNote} className='flex items-center space-x-2'>
        <Share2 />
        <span className='text-sm'>Share</span>
      </button>
    </div>
  )
}

export default InteractionButtons
