import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { GoogleOAuthProvider } from '@react-oauth/google'
// import { BrowserRouter } from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root'))
// const clientId = process.env.REACT_APP_CLINTID
// const clientSecret = process.env.REACT_APP_CLINT_SECRET

// In your configuration file or environment setup
const environment = process.env.NODE_ENV || 'development'; // Or however you determine environment

// let googleClientId;
if (environment === 'production') {
  clientId = process.env.REACT_APP_CLINTID_PRODUCTION;
  clientSecret = process.env.REACT_APP_CLINT_SECRET_PRODUCTION;
} else {
  clientId = process.env.REACT_APP_CLINTID_DEVELOPMENT;
  clientSecret = process.env.REACT_APP_CLINT_SECRET_DEVELOPMENT;
}

if (!clientId) {
  console.error('Missing Google Client ID')
}
if (!clientSecret) {
  console.error('Missing Google Client Secret')
}

// const clientId = '602074488635-piii53oipdpvft2ffd64eirv0aiq94sv.apps.googleusercontent.com'
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      {/* <BrowserRouter> */}
      <App />
      {/* </BrowserRouter> */}
    </GoogleOAuthProvider>
  </React.StrictMode>
)
