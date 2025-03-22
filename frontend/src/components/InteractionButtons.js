import { useState } from 'react'
import { Heart, MessageCircle, Share2, Copy } from 'lucide-react'

const InteractionButtons = ({ title, tag, description, showAlert }) => {
  const [liked, setLiked] = useState(false)
  const [copiedText, setCopiedText] = useState('')
  const [copiedElement, setCopiedElement] = useState('')

  const copyToClipboard = (element, text) => {
    const textToCopy = `Title: ${title}\nTag: ${tag}\n\nDescription:\n${description}`
    navigator.clipboard.writeText(textToCopy)
    setCopiedText(textToCopy) // Set state to show copied text
    // setCopiedElement(element)
    showAlert('Note Successfully copied!', '#D4EDDA')
    setTimeout(() => setCopiedText(''), 1500) // Clear message after 1.5 sec
  }

  return (
    <div className='flex items-center justify-between px-4 py-2 bottom-0 border-t border-gray-700'>
      {/* Like Button */}
      <button onClick={() => setLiked(!liked)} className='flex items-center space-x-2'>
        {liked ? <Heart className='text-red-500 fill-red-500' /> : <Heart />}
        <span className='text-sm'>{liked ? 'Liked' : 'Like'}</span>
      </button>

      {/* Comment Button */}
      <button className='flex items-center space-x-2'>
        <MessageCircle />
        <span className='text-sm'>Comment</span>
      </button>

      {/* Share Button */}
      <button
        onClick={(e) => copyToClipboard(e.currentTarget, `Title: ${title}\nTag: ${tag}\nDescription: ${description}`)}
        className='flex items-center space-x-2'
      >
        <Copy />
        <span className='text-sm'>Copy</span>
      </button>
    </div>
  )
}

export default InteractionButtons
