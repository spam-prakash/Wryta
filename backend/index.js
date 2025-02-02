// server.js

const connectToMongo = require('./db')
const cors = require('cors')
const express = require('express')
const jwt = require('jsonwebtoken')
const app = express()
const userdb = require('./models/User')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy

// Dynamic Port for Production/Local
const port = process.env.PORT || 8000

// Connect to MongoDB
connectToMongo()

const clientID = process.env.REACT_APP_CLINTID
const clientSecret = process.env.REACT_APP_CLINT_SECRET
const liveLink = process.env.REACT_APP_LIVE_LINK
const JWT_SECRET = process.env.JWT_SECRET

// Middleware for parsing JSON
app.use(express.json())

// CORS Configuration
const corsOptions = {
  origin: '*', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'auth-token', 'Access-Control-Allow-Origin'],
  credentials: true // If cookies or credentials need to be sent
}

app.use(cors(corsOptions))

app.use(passport.initialize()) // Initialize passport without session

// Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL: '/auth/google/callback',
      passReqToCallback: true
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        let user = await userdb.findOne({ googleId: profile.id })

        if (!user) {
          user = new userdb({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value
          })
          await user.save()
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, {
          expiresIn: '7d'
        })

        // Attach user and token to done callback
        return done(null, { user, token })
      } catch (error) {
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
    console.log('User Object from Passport:', req.user) // Debugging

    if (!req.user || !req.user.token) {
      return res.redirect(`${liveLink}/login?error=token_missing`)
    }

    // Send JWT token to frontend
    res.redirect(`${liveLink}/login-success?token=${req.user.token}`) // Change this to frontend URL
    console.log(`Redirecting to: ${liveLink}/login-success?token=${req.user.token}`)
  }
)

// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

// Test Route (Optional)
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Start Server
app.listen(port, () => {
  console.log(`Website rendered to http://localhost:${port}`)
})
