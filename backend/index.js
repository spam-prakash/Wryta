const connectToMongo = require('./db')
const cors = require('cors')
const express = require('express')
const app = express()
app.use(express.json())
const port = 8000
connectToMongo()
// app.use(cors({
//   origin: ['https://inotebook-frontend-murex.vercel.app'],
//   //   origin: ['http://localhost:8000'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true
// }))

app.use(cors())

// Avilable Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Website rendered to http://localhost:${port}`)
})
