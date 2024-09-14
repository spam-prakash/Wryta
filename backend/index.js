const connectToMongo = require('./db')
const cors = require('cors')
const express = require('express')
const app = express()

// Dynamic Port for Production/Local
const port = 8000

// Connect to MongoDB
connectToMongo()

// Middleware for parsing JSON
app.use(express.json())

// CORS Configuration
const allowedOrigins = [
  'https://inotebook-frontend-murex.vercel.app', // Deployed frontend URL
  'http://localhost:3006' // Local development
]

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) { // Allow requests with no origin (like mobile apps, Postman, etc.)
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // If you need to include cookies/auth tokens
}))

// Handle preflight requests
app.options('*', cors())

// Available Routes
app.use('/api/auth', require('./api/auth'))
app.use('/api/notes', require('./api/notes'))

// Test routes (Optional)
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/hii', (req, res) => {
  res.send('hii World!')
})

// Start Server
app.listen(port, () => {
  console.log(`Website rendered to http://localhost:${port}`)
})
