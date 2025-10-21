// utils/keepalive.js or backend/keepalive.js
require('dotenv').config()

// Use global fetch if available, else import node-fetch
const fetchFn = global.fetch || ((...args) => import('node-fetch').then(({ default: f }) => f(...args)))

const BACKEND_URL = `${process.env.REACT_APP_HOSTLINK}/ping`

async function pingBackend () {
  try {
    const res = await fetchFn(BACKEND_URL)
    console.log(`[${new Date().toISOString()}] Ping ${BACKEND_URL} → ${res.status}`)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Ping failed:`, err.message)
  }
}

// Ping every 12 minutes (Render free instances sleep after 15)
setInterval(pingBackend, 12 * 60 * 1000)
pingBackend()
