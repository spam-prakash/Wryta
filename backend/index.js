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
const corsOptions = {
  origin: 'https://inotebook-frontend-murex.vercel.app', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
  credentials: true // If cookies or credentials need to be sent
}

app.use(cors(corsOptions))

// You can also handle OPTIONS requests explicitly if needed
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://inotebook-frontend-murex.vercel.app')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Access-Control-Allow-Origin')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.sendStatus(200)
})
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
