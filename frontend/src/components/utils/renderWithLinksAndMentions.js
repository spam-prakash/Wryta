import React from 'react'

export default function renderWithLinksAndMentions (text = '') {
  if (typeof text !== 'string') return text

  // Match URLs or @mentions
  const regex = /(https?:\/\/[^\s]+|www\.[^\s]+|@[a-zA-Z0-9_]+)/g
  const parts = text.split(regex).filter(Boolean)

  return parts.map((part, i) => {
    if (typeof part !== 'string') return null

    // Handle URLs
    if (/^(https?:\/\/|www\.)/.test(part)) {
      const href =
        part.startsWith('http://') || part.startsWith('https://')
          ? part
          : `https://${part}`

      let displayText = part.replace(/^(https?:\/\/|www\.)/, '')
      if (displayText.length > 25) displayText = displayText.slice(0, 25) + '...'

      return (
        <a
          key={i}
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-500 underline break-words'
        >
          {displayText}
        </a>
      )
    }

    // Handle @mentions
    if (part.startsWith('@')) {
      const username = part.slice(1)
      return (
        <a
          key={i}
          href={`/u/${username}`} // adjust if your route differs
          className='text-purple-500 hover:underline font-medium'
        >
          {part}
        </a>
      )
    }

    // Normal text
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}
