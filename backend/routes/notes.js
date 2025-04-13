const express = require('express')
const router = express.Router()
const fetchuser = require('../middleware/fetchuser')
const Note = require('../models/Note')
const User = require('../models/User')
const { body, validationResult } = require('express-validator')

// ROUTE: 1 GET ALL NOTES GET:"/api/notes/fetchallnotes" LOGIN REQUIRED
router.get('/fetchallnotes', fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id })
    res.json(notes)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE: 2 ADD A NEW NOTE POST:"/api/notes/addnote" LOGIN REQUIRED
router.post('/addnote', [
  body('description', 'Description must be at least 3 characters').isLength({ min: 3 })
], fetchuser, async (req, res) => {
  try {
    const { title, description, tag, isPublic } = req.body

    // Debugging: log incoming isPublic
    // console.log('Received isPublic:', isPublic);

    // Convert isPublic to a boolean
    // const visibility = isPublic === 'true';  // Ensure 'true' string becomes boolean

    // Create new note
    const note = new Note({
      title,
      description,
      tag,
      isPublic, // Store as boolean
      user: req.user.id,
      date: Date.now()
    })

    // console.log('Note:', note);

    // Save note in database
    const savedNote = await note.save()
    res.json(savedNote)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE: 3 UPDATE A NOTE PUT:"/api/notes/updatenote/:id" LOGIN REQUIRED
router.put('/updatenote/:id', [
  body('description', 'Description must be at least 3 characters').isLength({ min: 3 })
], fetchuser, async (req, res) => {
  const { title, description, tag } = req.body

  try {
    // Create a new Note object
    const newNote = {
      title,
      description,
      tag,
      modifiedDate: Date.now() // Update the date to the current date and time
    }

    // Find the note to be updated
    let note = await Note.findById(req.params.id)
    if (!note) {
      return res.status(404).send('Not Found')
    }

    // Allow update only if user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send('Not Allowed')
    }

    // Update the note
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    )

    res.json(note)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE: 4 DELETE A NOTES DELETE:"/api/notes/deletenote" LOGIN REQUIRED
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id)
    if (!note) { return res.status(404).send('Not Found') }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send('Not Allowed')
    }

    note = await Note.findByIdAndDelete(req.params.id)
    note = await Note.findById(req.params.id)
    if (!note) { return res.status(200).json({ Success: 'NOTE HAS BEEN DELETED' }) }
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE 5: Update Note Visibility (PUT /api/notes/visibility/:id)
router.put('/visibility/:id', fetchuser, async (req, res) => {
  try {
    const { isPublic } = req.body
    const noteId = req.params.id

    // Ensure the note exists and belongs to the user
    const note = await Note.findById(noteId)
    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' })
    }

    // Convert isPublic to boolean
    const visibility = isPublic === 'true' || isPublic === true

    // Update only the isPublic field without modifying modifiedDate
    await Note.findByIdAndUpdate(
      noteId,
      { $set: { isPublic: visibility } }, // Only update isPublic
      { new: true, timestamps: false } // Prevents modifiedDate from updating
    )

    res.json({ success: true, message: 'Visibility updated successfully' })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE 6: Get Public Notes (GET /api/notes/public)
router.get('/public', async (req, res) => {
  try {
    const publicNotes = await Note.aggregate([
      { $match: { isPublic: true } },
      {
        $addFields: {
          sortDate: {
            $ifNull: ['$modifiedDate', '$createdDate'] // Prioritize modifiedDate, fallback to createdDate
          }
        }
      },
      { $sort: { sortDate: -1, _id: -1 } }, // Sort by latest date and then by ID for consistency
      {
        $lookup: {
          from: 'users', // Collection name for users
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' }, // Convert userDetails array into an object
      {
        $project: {
          'userDetails.password': 0, // Exclude sensitive fields
          'userDetails.tokens': 0
        }
      }
    ])

    res.json({ notes: publicNotes })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

router.get('/note/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('user', '-password -tokens')

    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }

    // Return the note along with the user details
    res.json(note)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

router.get('/note/:id/counts', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).select('likes shares copies downloads')
    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }
    res.json(note)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// Increment like count with user also
router.post('/note/:id/like', fetchuser, async (req, res) => {
  try {
    const noteId = req.params.id
    const userId = req.user.id

    const user = await User.findById(userId)

    if (user.actions.likes.includes(noteId)) {
      // If already liked, unlike the note
      await User.findByIdAndUpdate(userId, { $pull: { 'actions.likes': noteId } })
      await Note.findByIdAndUpdate(noteId, { $inc: { likes: -1 } })
      return res.json({ success: true, message: 'Note unliked' })
    } else {
      // If not liked, like the note
      await User.findByIdAndUpdate(userId, { $addToSet: { 'actions.likes': noteId } })
      await Note.findByIdAndUpdate(noteId, { $inc: { likes: 1 } })
      return res.json({ success: true, message: 'Note liked' })
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// Increment share count
router.post('/note/:id/share', fetchuser, async (req, res) => {
  try {
    const noteId = req.params.id
    const userId = req.user.id

    // Increment the share count for the note
    await Note.findByIdAndUpdate(noteId, { $inc: { shares: 1 } })

    // Add the note to the user's shared notes
    await User.findByIdAndUpdate(userId, { $addToSet: { 'actions.shares': noteId } })

    res.json({ success: true, message: 'Note shared successfully' })
  } catch (error) {
    console.error('Error sharing note:', error.message)
    res.status(500).send('Internal Server Error')
  }
})

// Increment copy count
router.post('/note/:id/copy', fetchuser, async (req, res) => {
  try {
    const noteId = req.params.id
    const userId = req.user.id

    // Increment the copy count for the note
    await Note.findByIdAndUpdate(noteId, { $inc: { copies: 1 } })

    // Add the note to the user's copied notes
    await User.findByIdAndUpdate(userId, { $addToSet: { 'actions.copies': noteId } })

    res.json({ success: true, message: 'Note copied successfully' })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// Increment download count
router.post('/note/:id/download', fetchuser, async (req, res) => {
  try {
    const noteId = req.params.id
    const userId = req.user.id

    // Increment the download count for the note
    await Note.findByIdAndUpdate(noteId, { $inc: { downloads: 1 } })

    // Add the note to the user's downloaded notes
    await User.findByIdAndUpdate(userId, { $addToSet: { 'actions.downloads': noteId } })

    res.json({ success: true, message: 'Note downloaded successfully' })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
