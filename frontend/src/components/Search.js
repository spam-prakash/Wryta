import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon, X } from 'lucide-react'

const Search = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ users: [], notes: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const hostLink = process.env.REACT_APP_HOSTLINK
  const searchRef = useRef(null)

  // 🧠 Fetch from backend
  const handleSearch = async () => {
    if (!query.trim()) return
    setIsLoading(true)
    setShowResults(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${hostLink}/api/search/${query}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token || ''
        }
      })

      const data = await response.json()
      if (data.success) {
        setResults(data)
      } else {
        setResults({ users: [], notes: [] })
      }
    } catch (err) {
      console.error(err)
      setResults({ users: [], notes: [] })
    } finally {
      setIsLoading(false)
    }
  }

  // 🔎 Trigger search on Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
    // ❌ Clear search
  }

  const clearSearch = () => {
    setQuery('')
    setResults({ users: [], notes: [] })
    setShowResults(false)
  }

  // 🧠 Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div ref={searchRef} className='fixed left-0 w-full z-10 px-4 pb-3 mt-20'>
      {/* Search Bar */}
      <div className='relative w-full flex max-w-lg mx-auto'>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Search notes or users...'
          className='block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-3xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white'
        />

        {query && (
          <button
            onClick={clearSearch}
            type='button'
            className='absolute right-14 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition z-30'
          >
            <X size={18} className='text-gray-600 dark:text-white' />
          </button>
        )}

        <button
          onClick={handleSearch}
          type='button'
          className='absolute top-0 right-0 p-2.5 text-sm font-medium h-full text-white bg-indigo-600 rounded-e-3xl border border-indigo-700 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 transition z-30'
        >
          <SearchIcon className='w-4 h-4 text-white' />
          <span className='sr-only'>Search</span>
        </button>
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div className='absolute mt-2 w-full max-w-lg left-1/2 -translate-x-1/2 bg-[#0a0d22]  backdrop-blur-xl rounded-xl shadow-lg border border-gray-700 max-h-72 overflow-y-auto z-40'>
          {isLoading ? (
            <p className='text-center text-gray-400 py-3'>Searching...</p>
          ) : (
            <>
              {results.users.length === 0 && results.notes.length === 0 ? (
                <p className='text-center text-gray-400 py-3'>No results found</p>
              ) : (
                <>
                  {/* USERS SECTION */}
                  {results.users.length > 0 && (
                    <div className='border-b-2 border-gray-300 last:border-none'>
                      <h4 className='px-4 py-2 text-white text-sm font-bold'>Users</h4>
                      {results.users.map((user) => (
                        <Link
                          key={user._id}
                          to={`/u/${user.username}`}
                          onClick={() => setShowResults(false)}
                          className='flex items-center gap-3 px-4 py-2 hover:bg-gray-800 transition border-b border-gray-700 last:border-none'
                        >
                          <img
                            src={user.image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`}
                            alt={user.name}
                            className='w-8 h-8 rounded-full'
                          />
                          <div>
                            <p className='text-sm text-white font-normal'>{user.name}</p>
                            <p className='text-xs text-gray-300'>@{user.username}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* NOTES SECTION */}
                  {results.notes.length > 0 && (
                    <div>
                      <h4 className='px-4 py-2 text-white text-sm font-bold'>Notes</h4>
                      {results.notes.map((note) => (
                        <Link
                          key={note._id}
                          to={`/note/${note._id}`}
                          onClick={() => setShowResults(false)}
                          className='block px-4 py-2 hover:bg-gray-800 transition border-b border-gray-700 last:border-none'
                        >
                          <p className='text-sm text-white font-normal'>{note.title}</p>
                          <p className='text-xs text-[#FDC116]'>#{note.tag}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Search
