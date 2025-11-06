const jwt = require('jsonwebtoken')

const JWT_SCREAT = process.env.JWTSIGN

const fetchuser = (req, res, next) => {
  // Allow preflight requests to pass through without authentication
  if (req.method && req.method.toUpperCase() === 'OPTIONS') return next()

  let token = req.header('auth-token')

  // Normalize token value (handle cases where frontends send 'undefined' or 'null')
  if (typeof token === 'string') {
    token = token.trim()
    if (token.toLowerCase() === 'undefined' || token.toLowerCase() === 'null' || token === '') {
      token = null
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Please authenticate using a valid token' })
  }

  try {
    // If token is prefixed with "Bearer ", remove the prefix
    if (token.startsWith('Bearer ')) token = token.slice(7).trim()

    const data = jwt.verify(token, JWT_SCREAT)

    // Handle different token structures
    req.user = data.user || data

    // Ensure we have a user ID
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid token structure' })
    }

    next()
  } catch (error) {
    // Log concise error for debugging without full stack in production
    console.error('Token verification error:', error && error.message ? error.message : error)
    return res.status(401).json({ error: 'Please authenticate using a valid token' })
  }
}

module.exports = fetchuser
