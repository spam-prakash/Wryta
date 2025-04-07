import React, { useState, useEffect } from 'react'
import { Search as SearchIcon } from 'lucide-react'

const Search = ({ filterText, setFilterText }) => {
  const [isScrolled, setIsScrolled] = useState(false) // State to track if the page is scrolled
  const [isInputVisible, setIsInputVisible] = useState(true) // State to toggle input visibility on mobile

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50) // Set to true if scrolled more than 50px
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const toggleInputVisibility = () => {
    setIsInputVisible(!isInputVisible)
  }

  return (
    <div className='fixed top-16 right-4 z-50'>
      <div
        className={`flex items-center bg-[#1E293B] text-white rounded-full shadow-md transition-all duration-300 ${
          isScrolled && !isInputVisible ? 'w-12 h-12' : 'w-full max-w-md px-4 py-2'
        }`}
      >
        <button
          onClick={toggleInputVisibility}
          className='flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#374151] focus:outline-none lg:hidden'
        >
          <SearchIcon size={24} />
        </button>
        {(!isScrolled || isInputVisible || window.innerWidth >= 1024) && (
          <input
            type='text'
            placeholder='Search notes...'
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className='w-full rounded-md border-gray-600 bg-[#374151] text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder-gray-400 outline-none'
          />
        )}
      </div>
    </div>
  )
}

export default Search
