const jwt = require('jsonwebtoken')

const JWT_SCREAT = process.env.JWTSIGN

const fetchuser = (req, res, next) => {
  const token = req.header('auth-token')
  if (!token) {
    return res.status(401).json({ error: 'Please authenticate using a valid token' })
  }
  try {
    // Try different token verification strategies
    const data = jwt.verify(token, JWT_SCREAT)

    // Handle different token structures
    req.user = data.user || data

    // Ensure we have a user ID
    if (!req.user.id) {
      return res.status(401).json({ error: 'Invalid token structure' })
    }

    next()
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(401).json({ error: 'Please authenticate using a valid token' })
  }
}

module.exports = fetchuser
