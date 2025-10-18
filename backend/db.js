require('dotenv').config()
const mongoose = require('mongoose')

const mongoURI = process.env.MONGOURI
let cachedConnection = null

const connectToMongo = async () => {
  if (cachedConnection) {
    console.log('⚡ Using cached MongoDB connection')
    return cachedConnection
  }

  try {
    const db = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      minPoolSize: 1,
      family: 4
    })

    cachedConnection = db
    console.log('✅ Connected to MongoDB Successfully')
    return db
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
  }
}

module.exports = connectToMongo
