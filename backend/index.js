const connectToMongo = require('./db')
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const app = express()
const userdb = require('./models/User')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy
const sendMail = require('./routes/mailer')
const { initSocket } = require('./socket')
const http = require('http')
const { getIO, onlineUsers, emitNotification } = require('./socket')

// Dynamic Port for Production/Local
const port = process.env.PORT || 8000

// Connect to MongoDB
connectToMongo()

const liveLink = process.env.REACT_APP_LIVE_LINK
const JWT_SECRET = process.env.JWT_SECRET
const hostLink = process.env.REACT_APP_HOSTLINK
const environment = process.env.NODE_ENV || 'development'

let redirectURL = process.env.REDIRECT_URL || '/auth/google/callback'
let clientID, clientSecret

if (environment === 'production') {
  clientID = process.env.REACT_APP_CLINTID_PRODUCTION
  clientSecret = process.env.REACT_APP_CLINT_SECRET_PRODUCTION
  redirectURL = `${hostLink}/auth/google/callback`
} else {
  clientID = process.env.REACT_APP_CLINTID_DEVELOPMENT
  clientSecret = process.env.REACT_APP_CLINT_SECRET_DEVELOPMENT
  redirectURL = '/auth/google/callback'
}

// Define your allowed origins array
const allowedOrigins = [
  'https://theprakash.xyz',
  'https://wryta-frontend.vercel.app',
  'http://localhost:3006'
]

// Create HTTP server FIRST
const server = http.createServer(app)

// Middleware for parsing JSON
app.use(express.json())

// Use Morgan only in production
if (environment === 'production') {
  app.use(morgan('combined'))
}

// Enhanced CORS configuration that accepts ALL headers
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  // Accept ALL headers including the problematic one
  allowedHeaders: '*', // This accepts any header
  exposedHeaders: [
    'auth-token',
    'Authorization',
    'x-auth-token'
  ],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false
}

// Apply CORS middleware globally
app.use(cors(corsOptions))

// Handle preflight requests explicitly
app.options('*', cors(corsOptions))

// Custom middleware to handle CORS headers properly
app.use((req, res, next) => {
  const origin = req.headers.origin

  // Allow the origin if it's in our allowed list
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  res.header('Access-Control-Allow-Credentials', 'true')

  // Accept ALL headers from frontend
  res.header('Access-Control-Allow-Headers', '*')

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  next()
})

// Initialize Socket.io
initSocket(server)

app.use(passport.initialize())

// Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL: `${redirectURL}`,
      passReqToCallback: true
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        let user = await userdb.findOne({ googleId: profile.id })

        if (!user) {
          user = await userdb.findOne({ email: profile.emails[0].value })

          if (user) {
            user.googleId = profile.id
            if (!user.image && profile.photos && profile.photos[0]) {
              user.image = profile.photos[0].value
            }
            await user.save()
          } else {
            user = new userdb({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              image: profile.photos?.[0]?.value || '',
              username: profile.emails[0].value.split('@')[0]
            })
            await user.save()

            const subject = 'Welcome to Wryta'
            const text = `Hello ${user.name},\n\nThank you for signing up for Wryta. We're excited to have you on board!\n\nBest regards,\nThe Wryta Team`
            const html = `<p>Hello ${user.name},</p><p>Thank you for signing up for <strong>Wryta</strong>. We're excited to have you on board!</p><p>Best regards,<br>The Wryta Team</p>`
            await sendMail(user.email, subject, text, html)
          }
        }

        const token = jwt.sign(
          {
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              username: user.username || user.email.split('@')[0]
            }
          },
          JWT_SECRET,
          { expiresIn: '30d' }
        )

        return done(null, { user, token })
      } catch (error) {
        console.error('Google Auth Error:', error)
        return done(error, null)
      }
    }
  )
)

// Google Authentication Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }))

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    if (!req.user || !req.user.token) {
      return res.redirect(`${liveLink}/login?error=token_missing`)
    }

    res.redirect(`${liveLink}/login-success?token=${req.user.token}`)
  }
)

// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))
app.use('/api/user', require('./routes/user'))
app.use('/api/notification', require('./routes/notification'))
app.use('/api/search', require('./routes/search'))
app.use('/api/upload', require('./routes/upload'))

// Health check endpoint
app.get('/ping', (req, res) => {
  console.log('Ping received at', new Date())
  res.status(200).send('Backend is awake')
})

// Test Route
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message.includes('CORS')) {
    console.error('CORS Error:', err.message)
    return res.status(200).json({
      success: false,
      error: 'CORS Error',
      message: err.message
    })
  }
  next(err)
})

// Start Server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
  // console.log('Allowed origins:', allowedOrigins)
})
