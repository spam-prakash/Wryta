import React, { forwardRef } from 'react'
import InteractionButtons from '../InteractionButtons'
import renderWithLinksAndMentions from './renderWithLinksAndMentions'

const HiddenDownloadCard = forwardRef(({ note, username, image, formatDate, formatTime }, ref) => {
  const imageAPI = process.env.REACT_APP_IMAGEAPI
  if (!note) return null

  const { title, tag, description, date, modifiedDate } = note

  const getAvatarURL = (username) => {
    const base = process.env.REACT_APP_IMAGEAPI
    return `${base}${encodeURIComponent(username)}&format=png`
  }

  if (!image) {
    image = getAvatarURL(username)
  }

  // Get the latest date for display
  const getLatestDate = () => {
    const dates = [note.publicDate, note.modifiedDate, note.date]
      .filter(Boolean)
      .map((d) => new Date(d))
      .filter((d) => !isNaN(d))

    if (!dates.length) return null
    return new Date(Math.max(...dates.map((d) => d.getTime())))
  }

  const latestDate = getLatestDate()

  // Format date properly
  const formatDateForDisplay = (date) => {
    if (!date) return 'Invalid Date'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTimeForDisplay = (date) => {
    if (!date) return ''
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  return (
    <div
      style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
    >
      <div
        ref={ref}
        style={{
          width: '100%',
          maxWidth: '32rem',
          minWidth: '320px',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '1.25rem' }}>
          {/* Big Wryta at top */}
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '3rem', letterSpacing: '-0.025em' }}>Wry</span>
            <span style={{ color: '#FDC116', fontWeight: 'bold', fontSize: '3rem', letterSpacing: '-0.025em' }}>ta</span>
          </div>

          {/* Thin line under Wryta */}
          <div style={{
            width: '100%',
            height: '2px',
            background: 'rgba(56, 189, 248, 0.3)',
            marginBottom: '1.25rem'
          }}
          />

          {/* Title */}
          <h2 style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            lineHeight: '1.4',
            marginBottom: '0.5rem',
            wordBreak: 'break-word'
          }}
          >
            {title || 'Untitled Note'}
          </h2>

          {/* Tag */}
          {tag?.length > 2 && (
            <div style={{
              color: '#FDC116',
              fontWeight: '500',
              fontSize: '0.875rem',
              marginBottom: '0.75rem'
            }}
            >
              # {tag}
            </div>
          )}

          {/* Description */}
          <div style={{
            color: '#94a3b8',
            fontSize: '0.875rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            marginBottom: '1.25rem',
            lineHeight: '1.5'
          }}
          >
            {description
              ? (
                <div>
                  {description.split(/\r?\n/).map((paragraph, idx) => {
                    if (!paragraph.trim()) return <br key={idx} />
                    return (
                      <p key={idx} style={{ marginBottom: '0.25rem' }}>
                        {renderWithLinksAndMentions(paragraph)}
                      </p>
                    )
                  })}
                </div>
                )
              : (
                  renderWithLinksAndMentions(description)
                )}
          </div>

          {/* Footer - Avatar, Username, Date on left, wryta on right same line */}
          <div style={{
            borderTop: '1px solid rgba(51, 65, 85, 0.3)',
            paddingTop: '0.75rem'
          }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {/* Left side: Avatar + Username and Date */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                {/* Avatar */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  background: '#1e293b',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
                >
                  <img
                    src={image || `${imageAPI}${encodeURIComponent(username)}`}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = `${imageAPI}${encodeURIComponent(username)}`
                    }}
                    alt={username}
                    crossOrigin='anonymous'
                    referrerPolicy='no-referrer'
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Username and Date - vertically stacked */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: '#e2e8f0', fontWeight: '500', fontSize: '0.875rem', lineHeight: '1.4' }}>
                    @{username}
                  </div>
                  {latestDate && (
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', lineHeight: '1.4' }}>
                      {formatDateForDisplay(latestDate)} at {formatTimeForDisplay(latestDate)}
                    </div>
                  )}
                </div>
              </div>

              {/* Right side: wryta */}
              <div style={{
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: '500',
                letterSpacing: '0.025em',
                paddingTop: '0.25rem'
              }}
              >
                wryta
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
})

export default HiddenDownloadCard
