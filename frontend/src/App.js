import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import About from './components/About'
import NoteState from './context/notes/NoteState'
import Alert from './components/Alert'
import { useState, useEffect } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import Profile from './components/Profile'

// const hostLink = 'http://locahost:8000'
const hostLink = 'https://inotebook-backend-opal.vercel.app'

function App () {
  const [alert, setAlert] = useState(null)
  const [user, setUser] = useState(null) // User state
  const showAlert = (message, type) => {
    setAlert({
      msg: message,
      type
    })
    setTimeout(() => {
      setAlert(null)
    }, 2000)
  }

  useEffect(() => {
    // Fetch user details if token exists
    const token = localStorage.getItem('token')
    if (token) {
      fetchUserDetails(token)
    }// eslint-disable-next-line
  }, []);

  const fetchUserDetails = async (token) => {
    try {
      const response = await fetch(`${hostLink}/api/auth/getuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token

        }
      })
      const data = await response.json()
      if (response.ok) {
        setUser(data)
      } else {
        showAlert('Failed to fetch user details', 'danger')
      }
    } catch (error) {
      showAlert('An error occurred', '#F8D7DA')
    }
  }
  return (
    <>
      <NoteState>
        <Router>
          <Navbar showAlert={showAlert} />
          <Alert alert={alert} />
          <div className='container'>
            <Routes>
              <Route exact path='/' key='/' element={<Home showAlert={showAlert} />} />
              <Route exact path='/about' key='/about' element={<About />} />
              <Route exact path='/login' key='/login' element={<Login showAlert={showAlert} setUser={setUser} />} />
              <Route exact path='/signup' key='/signup' element={<Signup showAlert={showAlert} />} />
              <Route exact path='/profile' key='/profile' element={<Profile user={user} />} />
            </Routes>
          </div>
        </Router>
      </NoteState>
    </>
  )
}

export default App
