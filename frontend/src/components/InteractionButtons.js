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
    const shareUrl = `${window.location.origin}/note/${noteId}`
    showAlert('Note link copied to clipboard!', '#D4EDDA')

    try {
      await navigator.clipboard.writeText(shareUrl)
      console.log('Note link copied to clipboard!')

      if (navigator.share) {
        await navigator.share({
          title: title || 'Shared Note',
          text: `Check out this note: ${title}`,
          url: shareUrl
        })
      } else {
        showAlert('Your browser does not support the Web Share API.')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      showAlert('Failed to share note. Please try again.', '#F8D7DA')
    }
  }

  return (
    <div className='flex items-center justify-between px-4 py-2 bottom-0 border-t border-gray-700'>
      {/* Copy Button */}
      <button onClick={copyToClipboard} className='flex items-center space-x-2'>
        <Copy />
        <span className='text-sm'>Copy</span>
      </button>

      {/* Download Button */}
      <button onClick={downloadCardAsImage} className='flex items-center space-x-2'>
        <Download />
        <span className='text-sm'>Download</span>
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
