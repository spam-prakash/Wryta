import { useEffect, useRef } from 'react'

export const useNoteView = (noteId, onView, isOwner = false) => {
  const ref = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    // Don't track views if user is the owner
    if (!ref.current || isOwner) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // Start 700ms timer when note becomes 50% visible
          timerRef.current = setTimeout(() => {
            onView(noteId)
          }, 700)
        } else {
          // Clear timer when note leaves viewport or becomes <50% visible
          clearTimeout(timerRef.current)
        }
      },
      { threshold: [0.5] }
    )

    observer.observe(ref.current)

    return () => {
      clearTimeout(timerRef.current)
      observer.disconnect()
    }
  }, [noteId, onView, isOwner])

  return ref
}
