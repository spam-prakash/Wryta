import './App.css'
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import About from './components/About'
import NoteState from './context/notes/NoteState'
import Alert from './components/Alert'
import { useState, useEffect } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import Profile from './components/Profile'
import OthersProfile from './components/OthersProfile'
import RequestResetPassword from './components/RequestResetPassword'
import ResetPassword from './components/ResetPassword'
import SharedNote from './components/SharedNote'

// const hostLink = 'http://locahost:8000'
// const hostLink = 'https://inotebook-backend-opal.vercel.app'
const hostLink = process.env.REACT_APP_HOSTLINK

function App () {
  const [alert, setAlert] = useState(null)
  const [user, setUser] = useState(null) // User state
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Authentication state

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
    } // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Update authentication state whenever the user state changes
    setIsAuthenticated(!!user)
  }, [user])

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
        // console.log('User details fetched:', data)
      } else {
        showAlert('Failed to fetch user details!', '#F8D7DA')
      }
    } catch (error) {
      showAlert('An error occurred!', '#F8D7DA')
    }
  }

  return (
    <>
      <NoteState>
        <Router>
          <Navbar showAlert={showAlert} user={user} setUser={setUser} setIsAuthenticated={setIsAuthenticated} />

          <Alert alert={alert} />
          <div className='container'>
            <Routes>
              {/* <Route
                exact path='/'
                element={isAuthenticated ? <Home showAlert={showAlert} isAuthenticated={isAuthenticated} /> : <Navigate to='/login' />}
              /> */}
              <Route exact path='/' element={<Home showAlert={showAlert} isAuthenticated={isAuthenticated} />} />
              <Route exact path='/about' key='/about' element={<About />} />
              <Route exact path='/login' key='/login' element={<Login showAlert={showAlert} setUser={setUser} />} />
              <Route exact path='/signup' key='/signup' element={<Signup showAlert={showAlert} />} />
              <Route exact path='/profile' key='/profile' element={<Profile showAlert={showAlert} user={user} />} />
              <Route path='*' key='/' element={<Home />} />
              <Route path='/:username' element={<OtherProfileWrapper loggedInUser={user} showAlert={showAlert} />} />

              <Route path='/login-success' element={<Login />} />
              <Route path='/request-reset-password' element={<RequestResetPassword showAlert={showAlert} />} />
              <Route path='/reset-password' element={<ResetPassword showAlert={showAlert} />} />
              <Route path='/note/:id' element={<SharedNote showAlert={showAlert} />} />
            </Routes>
          </div>
        </Router>
      </NoteState>
    </>
  )
}

const OtherProfileWrapper = ({ loggedInUser, showAlert }) => {
  const { username } = useParams()
  const reservedRoutes = ['dashboard', 'settings', 'profile'] // Add existing routes here

  if (reservedRoutes.includes(username)) {
    return <h1 className='text-center text-red-500 mt-20'>Page not found</h1>
  }

  return <OthersProfile loggedInUser={loggedInUser} showAlert={showAlert} />
}

export default App
