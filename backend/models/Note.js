const mongoose = require('mongoose')

const NoteSchema = new mongoose.Schema({
  title: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  tag: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    default: Date.now
  },
  modifiedDate: {
    type: Date
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  copies: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  actions: {
    likes: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        name: String
      }
    ],
    shares: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        name: String
      }
    ],
    copies: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        name: String
      }
    ],
    downloads: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        name: String
      }
    ]
  }
})

module.exports = mongoose.model('Note', NoteSchema)
