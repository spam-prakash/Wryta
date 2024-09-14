const jwt = require('jsonwebtoken')


const JWT_SCREAT = 'heygoogleremindmrmetowatertheplant'
// const JWT_SCREAT = process.env.JWTSIGN;

const fetchuser = (req, res, next) => {
  const token = req.header('auth-token')
  if (!token) {
    res.status(401).send('Please authenticate using a valid token')
  }
  try {
    const data = jwt.verify(token, JWT_SCREAT)
    req.user = data.user
    next()
  } catch (error) {
    res.status(401).send('Please authenticate using a valid token')
  }
}

module.exports = fetchuser
