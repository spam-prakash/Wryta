// const { type } = require('@testing-library/user-event/dist/type')
const mongoose = require('mongoose')
const { Schema } = mongoose

const UserSchema = new Schema({
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
  }
})
const User = mongoose.model('user', UserSchema)
User.createIndexes()

module.exports = User
