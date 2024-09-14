require('dotenv').config()
const mongoose = require('mongoose')
// const mongoURI=process.env.MONGOURI
const mongoURI = 'mongodb://127.0.0.1:27017/inotebook'
// const mongoURI = 'mongodb+srv://akash_raushan_:akash12345@cluster0.cjsil.mongodb.net/inotebook'
// console.log(mongoURI)

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000000000,
      connectTimeoutMS: 30000000000,
      socketTimeoutMS: 4500000000
    })
    console.log('Connected to Mongoose Successfully')
  } catch (error) {
    console.error('Failed to connect to Mongoose Edited:', error)
  }
}

// mongoose.connect(mongoURI).then(()=>{
//     console.log("Connected")
// }).catch((err)=>{console.log("Error Occured ",err)})

module.exports = connectToMongo
