const connectToMongo = require('./db')
const cors = require('cors')
const express = require('express')
const app = express()
app.use(express.json())
const port = 8000
connectToMongo()

// CORS Configuration
// const allowedOrigins = [
//   'https://inotebook-frontend-murex.vercel.app', // Deployed frontend URL
//   'http://localhost:3006' // Local development
// ]

// app.use(cors({
//   origin: 'https://inotebook-frontend-murex.vercel.app', // Frontend domain
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true // If you need to include cookies/auth tokens
// }))

// app.options('*', (req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', 'https://inotebook-frontend-murex.vercel.app')
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
//   res.setHeader('Access-Control-Allow-Credentials', 'true')
//   res.status(200).send()
// })

app.use(cors())

// Avilable Routes
app.use('/api/auth', require('./api/auth'))
app.use('/api/notes', require('./api/notes'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/hii', (req, res) => {
  res.send('hii World!')
})

app.listen(port, () => {
  console.log(`Website rendered to http://localhost:${port}`)
})
