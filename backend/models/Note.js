const mongoose = require('mongoose')

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
    required: true
  },
  tag: {
    type: String,
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
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Store liked note IDs
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    copies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downloads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }
})

module.exports = mongoose.model('Note', NoteSchema)
