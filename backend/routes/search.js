const express = require('express')
const User = require('../models/User')
const Note = require('../models/Note') // Ensure the correct path
const router = express.Router()
const sendMail = require('./mailer')
// const { body, validationResult } = require('express-validator')
// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')
// const fetchuser = require('../middleware/fetchUser')
const fetchuser = require('../middleware/fetchuser')
const liveLink = process.env.REACT_APP_LIVE_LINK

router.post('/:q', fetchuser, async (req, res) => {
  try {
    const { q } = req.params
    const query = q.trim()

    if (!query) {
      return res.status(400).json({ success: false, message: 'Empty search query' })
    }
    const userId = req.user.id // fetched from middleware

    // Search notes (title, tag, description)
    const notes = await Note.find({
      $and: [
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { tag: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ]
        },
        {
          // ✅ show:
          // - public notes
          // - OR private notes if they belong to the logged-in user
          $or: [
            { isPublic: true },
            { user: userId }
          ]
        }
      ]
    }).populate('user', 'username name image')

    // Search users (name, username)
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    }).select('username name image bio')

    res.status(200).json({
      success: true,
      notes,
      users
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
})

module.exports = router
