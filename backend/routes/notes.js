const express = require('express')
const router = express.Router()
const fetchuser = require('../middleware/fetchuser')
const Note = require('../models/Note')
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
  body('title', 'Title Must be at least 3 characters').isLength({ min: 3 }),
  body('description', 'Description Must be at least 3 characters').isLength({ min: 3 })
], fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body
    const note = new Note({
      title,
      description,
      tag,
      user: req.user.id,
      date: Date.now() // Set the date to the current date and time
    })
    const savedNote = await note.save()
    res.json(savedNote)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE: 3 UPDATE A NOTE PUT:"/api/notes/updatenote/:id" LOGIN REQUIRED
router.put('/updatenote/:id', [
  body('title', 'Title must be at least 3 characters').isLength({ min: 3 }),
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
    };

    // Find the note to be updated
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send('Not Found');
    }

    // Allow update only if user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send('Not Allowed');
    }

    // Update the note
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );

    res.json(note);
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





// ROUTE 5: Update Note Visibility (PUT /api/notes/visibility/:id)
router.put('/visibility/:id', fetchuser, async (req, res) => {
  try {
      const { isPublic } = req.body;
      const noteId = req.params.id;

      // Ensure the note exists and belongs to the user
      let note = await Note.findById(noteId);
      if (!note) {
          return res.status(404).json({ error: 'Note not found' });
      }
      if (note.user.toString() !== req.user.id) {
          return res.status(401).json({ error: 'Not authorized' });
      }

      // Update only the isPublic field without modifying modifiedDate
      await Note.findByIdAndUpdate(
          noteId,
          { $set: { isPublic } }, // Only update isPublic
          { new: true, timestamps: false } // Prevents modifiedDate from updating
      );

      res.json({ success: true, message: 'Visibility updated successfully' });
  } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
  }
});



module.exports = router
