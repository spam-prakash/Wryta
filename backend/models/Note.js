const mongoose = require('mongoose')

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: 'General'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    default: Date.now
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
})

module.exports = mongoose.model('Note', NoteSchema)
