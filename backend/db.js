require('dotenv').config()
const mongoose = require('mongoose')
const mongoURI = process.env.MONGOURI
// console.log(mongoURI)

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5, // ✅ Limits concurrent open connections
      minPoolSize: 1, // ✅ Keeps at least one connection alive
      family: 4
    })
    console.log('Connected to Mongoose Successfully')
  } catch (error) {
    console.error('Failed to connect to Mongoose Edited:', error)
  }
}

// ✅ Handle graceful shutdown (CTRL+C / server stop)
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('🔌 Mongoose connection closed due to app termination')
  process.exit(0)
})

// mongoose.connect(mongoURI).then(()=>{
//     console.log("Connected")
// }).catch((err)=>{console.log("Error Occured ",err)})

module.exports = connectToMongo
