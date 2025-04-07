import React, { useState, useEffect } from 'react'

const Search = ({ filterText, setFilterText }) => {
  const [isScrolled, setIsScrolled] = useState(false) // State to track if the page is scrolled

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50) // Set to true if scrolled more than 50px
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className={`${
        isScrolled ? 'fixed top-0 left-0 w-full z-10 bg-[#] py-2 px-3 md:mt-20 mt-16 flex justify-center' : 'flex justify-center sm:mt-0 md:mt-10'
      }`}
    >
      <input
        type='text'
        placeholder='Filter notes by title, description, tag, or username...'
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className='px-4 py-2 rounded-full border bg-[#1E293B] text-white border-gray-600 hover:border-white hover:bg-[#374151] w-full max-w-md'
      />
    </div>
  )
}

export default Search
