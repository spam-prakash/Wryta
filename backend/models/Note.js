const mongoose = require('mongoose')

const NoteSchema = new mongoose.Schema({
  title: String,
  description: {
    type: String,
    required: true
  },
  tag: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    default: Date.now
  },
  modifiedDate: Date,
  isPublic: {
    type: Boolean,
    default: false
  },
  publicDate: Date,
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
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    copies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downloads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }

})

module.exports = mongoose.model('Note', NoteSchema)
