const mongoose = require('mongoose')
const { Schema } = mongoose

const NotesSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
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
  date: {
    type: Date,
    default: Date.now
  },
  modifiedDate: {
    type: Date
  }, 
  isPublic: { 
    type: Boolean, 
    // default: false 
  }, // Visibility Field
})

module.exports = mongoose.model('notes', NotesSchema)
