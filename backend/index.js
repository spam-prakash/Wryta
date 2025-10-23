const connectToMongo = require('./db')
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const app = express()
const userdb = require('./models/User')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy
const sendMail = require('./routes/mailer') // Import the mailer module

// Dynamic Port for Production/Local
const port = process.env.PORT || 8000

// Connect to MongoDB
connectToMongo()

// const liveLink=process.env.REACT_APP_LIVE_LINK
// const clientID = process.env.REACT_APP_CLINTID
// const clientSecret = process.env.REACT_APP_CLINT_SECRET
const liveLink = process.env.REACT_APP_LIVE_LINK
const JWT_SECRET = process.env.JWT_SECRET
const hostLink = process.env.REACT_APP_HOSTLINK
// console.log('Host Link:', hostLink) // Debugging

const environment = process.env.NODE_ENV || 'development' // Or however you determine environment
// console.log('Environment:', environment)
let redirectURL = process.env.REDIRECT_URL || '/auth/google/callback'
// console.log('Redirect URL:', redirectURL)

// let googleClientId;
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

// Middleware for parsing JSON
app.use(express.json())

// Use Morgan only in production
if (environment === 'production') {
  app.use(morgan('combined'))
}

const corsOptions = {
  origin: ['https://theprakash.xyz', 'https://wryta-frontend.vercel.app', 'http://localhost:3006'], // Add allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'auth-token', 'Access-Control-Allow-Origin'],
  credentials: true // Allow cookies and credentials
}

app.use(cors(corsOptions))

app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://theprakash.xyz') // Allow specific origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Access-Control-Allow-Origin')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.sendStatus(200)
})

app.use(passport.initialize()) // Initialize passport without session

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
        // Try finding by googleId first
        let user = await userdb.findOne({ googleId: profile.id })

        // If no user found with googleId, check for existing email
        if (!user) {
          user = await userdb.findOne({ email: profile.emails[0].value })

          if (user) {
            // User exists via email signup — link Google ID
            user.googleId = profile.id
            if (!user.image && profile.photos && profile.photos[0]) {
              user.image = profile.photos[0].value // Add image if missing
            }
            await user.save()
          } else {
            // Create a new user
            user = new userdb({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              image: profile.photos?.[0]?.value || '',
              username: profile.emails[0].value.split('@')[0]
            })
            await user.save()

            // Send welcome email
            const subject = 'Welcome to Wryta'
            const text = `Hello ${user.name},\n\nThank you for signing up for Wryta. We're excited to have you on board!\n\nBest regards,\nThe Wryta Team`
            const html = `<p>Hello ${user.name},</p><p>Thank you for signing up for <strong>Wryta</strong>. We're excited to have you on board!</p><p>Best regards,<br>The Wryta Team</p>`
            await sendMail(user.email, subject, text, html)
          }
        }

        // Generate JWT Token
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
          { expiresIn: '7d' }
        )

        // Attach user and token to done callback
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
    // console.log('User Object from Passport:', req.user) // Debugging

    if (!req.user || !req.user.token) {
      return res.redirect(`${liveLink}/login?error=token_missing`)
    }

    // Send JWT token to frontend
    res.redirect(`${liveLink}/login-success?token=${req.user.token}`) // Change this to frontend URL
    // console.log(`Redirecting to: ${liveLink}/login-success?token=${req.user.token}`);
  }
)

// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))
app.use('/api/user', require('./routes/user')) // Ensure this line exists
app.use('/api/search', require('./routes/search')) // Ensure this line exists
app.use('/api/upload', require('./routes/upload'))
// Inside your index.js (after app is defined)
app.get('/ping', (req, res) => {
  console.log('Ping received at', new Date())
  res.status(200).send('Backend is awake')
})

// Test Route (Optional)
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Start Server
app.listen(port, () => {
  console.log(`Website rendered to http://localhost:${port}`)
})
