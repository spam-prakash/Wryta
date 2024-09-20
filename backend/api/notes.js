const express = require('express')
const router = express.Router()
const fetchuser = require('../middleware/fetchuser')
const Note = require('../models/Note')
const { body, validationResult } = require('express-validator')

// ROUTE: 1 GET ALL NOTES GET:"/api/notes/fetchallnotes" LOGIN REQUIRED
router.get('/fetchallnotes', fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(notes)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE: 2 ADD NOTES POST:"/api/notes/addnote" LOGIN REQUIRED
router.post('/addnote', [
  body('title', 'Title Must be atleast 3 characters').isLength({ min: 0 }),
  body('description', 'Descprition Must be atleast 3 characters').isLength({ min: 0 })
], fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body
    // IF there are errors, return 400 BAD request nad error
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const note = new Note({
      title,
      description,
      tag,
      user: req.user.id
    })
    const saveNote = await note.save()
    res.json(saveNote)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
}
)

// ROUTE: 3 UPADTE A NOTES PUT:"/api/notes/updatenote" LOGIN REQUIRED
router.put('/updatenote/:id', [
  body('title', 'Title Must be atleast 3 characters').isLength({ min: 3 }),
  body('description', 'Descprition Must be atleast 3 characters').isLength({ min: 3 })
], fetchuser, async (req, res) => {
  const { title, description, tag } = req.body
  // Create a new Note Object
  try {
    const newNote = {}
    if (title) { newNote.title = title }
    if (description) { newNote.description = description }
    if (tag) { newNote.tag = tag }

    let note = await Note.findById(req.params.id)
    if (!note) { return res.status(404).send('Not Found') }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send('Not Allowed')
    }
    note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
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
    // res.json({note:note})
    if (!note) { return res.status(200).json({ Success: 'NOTE HAS BEEN DELETED' }) }
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})
module.exports = router
