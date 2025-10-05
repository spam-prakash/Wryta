import React from 'react'
import { RingLoader } from 'react-spinners'

function Loader () {
  return (

    <>
      <div className='flex items-center justify-center min-h-screen'>

        <RingLoader
          color='#1924b5'
          size={79}
        />
      </div>
    </>
  )
}

export default Loader
