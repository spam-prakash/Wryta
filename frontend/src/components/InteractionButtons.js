import { useState } from 'react'
import { Heart, MessageCircle, Share2 } from 'lucide-react'

const InteractionButtons = () => {
  const [liked, setLiked] = useState(false)

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
      <button className='flex items-center space-x-2'>
        <Share2 />
        <span className='text-sm'>Share</span>
      </button>
    </div>
  )
}

export default InteractionButtons
