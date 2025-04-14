const express = require('express')
const User = require('../models/User')
const Note = require('../models/Note') // Ensure the correct path
const router = express.Router()
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const fetchuser = require('../middleware/fetchUser')
const fetchuser = require('../middleware/fetchuser')

router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params

    // Log the username for debugging
    // console.log('Username from request:', username)

    // Find user by username
    const user = await User.findOne({ username })

    if (!user) {
      console.log(`User not found: ${username}`)
      return res.status(404).json({ error: 'User not found' })
    }

    // Fetch notes of the user
    const notes = await Note.find({ user: user._id })

    // Fetch only public notes
    const publicNotes = notes.filter((note) => note.isPublic)

    // Prepare user data response
    const userData = {
      name: user.name,
      email: user.email,
      username: user.username,
      profilePic: user.image?.trim() ? user.image : null,
      totalNotes: notes.length,
      publicNotesCount: publicNotes.length,
      likesCount: user.actions.likes.length,
      publicNotes: publicNotes.map((note) => ({
        _id: note._id,
        title: note.title,
        tag: note.tag,
        description: note.description,
        date: note.date,
        modifiedDate: note.modifiedDate,
        likes: note.likes,
        copies: note.copies,
        downloads: note.downloads,
        shares: note.shares
      }))
    }

    // console.log('User data:', userData)

    res.json(userData)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// Get user's liked notes
router.get('/useraction/likednotes', fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('actions.likes').populate('actions.likes')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user.actions.likes)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
