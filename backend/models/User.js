const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: false
  },
  username: {
    type: String,
    required: false,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    required: false
  },
  follower: {
    count: { type: Number, default: 0 },
    list: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        username: String,
        name: String,
        profilePic: String
      }
    ]
  },
  following: {
    count: { type: Number, default: 0 },
    list: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        username: String,
        name: String,
        profilePic: String
      }
    ]
  },
  actions: {
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }], // Store liked note IDs
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
    copies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
    downloads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }]
  }
})

module.exports = mongoose.model('User', UserSchema)
