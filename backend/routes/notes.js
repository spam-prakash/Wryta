const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const fetchuser = require('../middleware/fetchuser')
const Note = require('../models/Note')
const User = require('../models/User')
const sendMail = require('./mailer')
const { body, validationResult } = require('express-validator')
const liveLink = process.env.REACT_APP_LIVE_LINK

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

    // Create and save the note
    const note = new Note({
      title,
      description,
      tag,
      isPublic,
      user: req.user.id,
      date: Date.now()
    })
    const savedNote = await note.save()

    const user = await User.findById(req.user.id).select('name username follower list email')

    // ----------------------------------------
    // ✳️ Detect mentions (@username)
    // ----------------------------------------
    const mentionPattern = /@([a-zA-Z0-9._-]+)/g
    const mentionedUsernames = []
    let match
    while ((match = mentionPattern.exec(description)) !== null) {
      mentionedUsernames.push(match[1])
    }

    // If mentions exist, notify mentioned users
    if (mentionedUsernames.length > 0) {
      for (const username of mentionedUsernames) {
        const mentionedUser = await User.findOne({ username }).select('email name')
        if (mentionedUser && mentionedUser.email) {
          const subject = `${user.name} mentioned you in a note`
          const html = `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>📩 You were mentioned in a note!</h2>
                <p>Hi <strong>${mentionedUser.name}</strong>,</p>
                <p>
                  <strong><a href="${liveLink}/u/${user.username}">${user.name}</a></strong>
                  mentioned you in a note:
                </p>
                <a href="${liveLink}/note/${savedNote._id}"
                   style="background:#4F46E5;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">
                   View Note
                </a>
                <br><br>
                <p style="font-size:0.9em;color:#777;">– The Wryta Team</p>
              </body>
            </html>
          `
          try {
            await sendMail(mentionedUser.email, subject, '', html)
          } catch (err) {
            console.error('Failed to send mention email:', err.message)
          }
        }
      }
    }

    // ----------------------------------------
    // 📢 Send mail to followers if note is public
    // ----------------------------------------
    if (isPublic) {
      const followers = user.follower.list || []
      const subject = `📝 New Note Added by ${user.name}`
      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>🆕 New Note Added!</h2>
            <p>Hi,</p>
            <p>
              <strong><a href="${liveLink}/u/${user.username}">${user.name}</a></strong>
              has added a new note titled <em>“${title}”</em>.
            </p>
            <a href="${liveLink}/note/${savedNote._id}"
               style="background:#4F46E5;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">
               View Note
            </a>
            <br><br>
            <p style="font-size:0.9em;color:#777;">– The Wryta Team</p>
          </body>
        </html>
      `

      for (const followerId of followers) {
        const follower = await User.findById(followerId).select('email')
        if (follower && follower.email) {
          try {
            await sendMail(follower.email, subject, '', html)
          } catch (err) {
            console.error('Failed to send follower email:', err.message)
          }
        }
      }
    }

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
    let note = await Note.findById(req.params.id)
    if (!note) {
      return res.status(404).send('Not Found')
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send('Not Allowed')
    }

    // Find the user performing the edit
    const user = await User.findById(req.user.id).select('name username email')

    // Extract mentions from previous note
    const oldMentionPattern = /@([a-zA-Z0-9._-]+)/g
    const oldMentions = []
    let match
    while ((match = oldMentionPattern.exec(note.description)) !== null) {
      oldMentions.push(match[1])
    }

    // Extract mentions from updated note description
    const newMentionPattern = /@([a-zA-Z0-9._-]+)/g
    const newMentions = []
    while ((match = newMentionPattern.exec(description)) !== null) {
      newMentions.push(match[1])
    }

    // Find which mentions are new and which are old
    const newlyMentioned = newMentions.filter(u => !oldMentions.includes(u))
    const previouslyMentioned = oldMentions.filter(u => newMentions.includes(u))

    // Update the note
    const newNote = {
      title,
      description,
      tag,
      modifiedDate: Date.now()
    }

    note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })

    // Base link for emails
    const noteLink = `${liveLink}/note/${note._id}`

    // --------------------------------------------
    // 🆕 Send email to newly mentioned users
    // --------------------------------------------
    for (const username of newlyMentioned) {
      const mentionedUser = await User.findOne({ username }).select('email name')
      if (mentionedUser && mentionedUser.email) {
        const subject = `${user.name} mentioned you in a note`
        const html = `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2>📩 You were mentioned in a note!</h2>
              <p>Hi <strong>${mentionedUser.name}</strong>,</p>
              <p>
                <strong><a href="${liveLink}/u/${user.username}">${user.name}</a></strong>
                mentioned you in an updated note:
              </p>
              <a href="${noteLink}"
                 style="background:#4F46E5;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">
                 View Note
              </a>
              <br><br>
              <p style="font-size:0.9em;color:#777;">– The Wryta Team</p>
            </body>
          </html>
        `
        try {
          await sendMail(mentionedUser.email, subject, '', html)
        } catch (err) {
          console.error('Failed to send new mention email:', err.message)
        }
      }
    }

    // --------------------------------------------
    // ✏️ Send email to previously mentioned users
    // --------------------------------------------
    for (const username of previouslyMentioned) {
      const mentionedUser = await User.findOne({ username }).select('email name')
      if (mentionedUser && mentionedUser.email) {
        const subject = '✏️ A note you were mentioned in was updated'
        const html = `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2>✏️ A note was updated!</h2>
              <p>Hi <strong>${mentionedUser.name}</strong>,</p>
              <p>
                The note where you were mentioned by 
                <strong><a href="${liveLink}/u/${user.username}">${user.name}</a></strong> 
                has been updated.
              </p>
              <a href="${noteLink}"
                 style="background:#4F46E5;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">
                 View Updated Note
              </a>
              <br><br>
              <p style="font-size:0.9em;color:#777;">– The Wryta Team</p>
            </body>
          </html>
        `
        try {
          await sendMail(mentionedUser.email, subject, '', html)
        } catch (err) {
          console.error('Failed to send new mention email:', err.message)
        }
      }
    }

    res.json(note)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE: 4 DELETE A NOTES DELETE:"/api/notes/deletenote" LOGIN REQUIRED
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) { return res.status(404).send('Not Found') }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send('Not Allowed')
    }

    // Delete the note
    const deletedNote = await Note.findByIdAndDelete(req.params.id)
    if (!deletedNote) {
      return res.status(404).json({ success: false, message: 'Note not found or already deleted' })
    }

    // Clean up: remove this note's ID from all users' action arrays
    // (likes, shares, copies, downloads)
    await User.updateMany(
      {
        $or: [
          { 'actions.likes': deletedNote._id },
          { 'actions.shares': deletedNote._id },
          { 'actions.copies': deletedNote._id },
          { 'actions.downloads': deletedNote._id }
        ]
      },
      {
        $pull: {
          'actions.likes': deletedNote._id,
          'actions.shares': deletedNote._id,
          'actions.copies': deletedNote._id,
          'actions.downloads': deletedNote._id
        }
      }
    )

    return res.status(200).json({ success: true, message: 'Note deleted and user actions cleaned up' })
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

    // Set or remove publicDate based on visibility
    const updateFields = {
      isPublic: visibility,
      publicDate: visibility ? new Date() : null
    }

    // Update the note without modifying modifiedDate
    await Note.findByIdAndUpdate(
      noteId,
      { $set: updateFields },
      { new: true, timestamps: false }
    )

    res.json({
      success: true,
      message: visibility
        ? 'Note made public'
        : 'Note made private'
    })
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

router.get('/note/:id', fetchuser, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('user', '-password -tokens')

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' })
    }

    const loggedInUserId = req.user.id

    // ✅ Check if the logged-in user is mentioned in the note
    let isMentioned = false

    // If you store mentions as usernames or user IDs
    if (Array.isArray(note.mentions)) {
      isMentioned = note.mentions.some(
        (mention) =>
          mention.toString().toLowerCase() === loggedInUserId.toString().toLowerCase()
      )
    } else if (typeof note.description === 'string') {
      // If mentions are within text like @username
      const user = await User.findById(loggedInUserId)
      if (user && user.username) {
        const mentionPattern = new RegExp(`@${user.username}\\b`, 'i')
        isMentioned = mentionPattern.test(note.description)
      }
    }

    // ✅ Allow access if:
    // 1. The note is public
    // 2. OR the note belongs to the logged-in user
    // 3. OR the user is mentioned
    if (!note.isPublic && note.user._id.toString() !== loggedInUserId && !isMentioned) {
      return res
        .status(401)
        .json({ success: false, message: 'Access denied — private note' })
    }

    res.status(200).json({ success: true, note })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
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
    const likingUserId = req.user?.id

    if (!noteId || !likingUserId) {
      return res.status(400).json({ success: false, message: 'Invalid request data' })
    }

    const note = await Note.findById(noteId)
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' })

    const noteOwner = await User.findById(note.user)
    const likingUser = await User.findById(likingUserId)
    if (!noteOwner || !likingUser) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // ✅ Check if user already liked (direct ID comparison)
    const alreadyLiked = note.actions.likes.some(
      (id) => id.toString() === likingUserId.toString()
    )

    if (alreadyLiked) {
      // 🧹 Unlike
      await Note.findByIdAndUpdate(noteId, {
        $pull: { 'actions.likes': likingUserId },
        $inc: { likes: -1 }
      })

      await User.findByIdAndUpdate(likingUserId, {
        $pull: { 'actions.likes': noteId }
      })

      return res.json({ success: true, message: 'Note unliked' })
    } else {
      // ❤️ Like
      await Note.findByIdAndUpdate(noteId, {
        $addToSet: { 'actions.likes': likingUserId },
        $inc: { likes: 1 }
      })

      await User.findByIdAndUpdate(likingUserId, {
        $addToSet: { 'actions.likes': noteId }
      })

      const updatedNote = await Note.findById(noteId)
      const totalLikes = updatedNote?.likes || 0

      // ✉️ Send mail only if not a self-like
      if (noteOwner._id.toString() !== likingUserId.toString()) {
        const email = noteOwner.email
        const subject = 'Your note just got a like! 🎉'
        const html = `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2>🎉 Your note just got a like!</h2>
              <p>Hi <strong>${noteOwner.name}</strong>,</p>
              <p>
                <strong><a href="${liveLink}/u/${likingUser.username}">${likingUser.name}</a></strong>
                just liked your note: <em>“${note.title}”</em>.
              </p>
              <a href="${liveLink}/note/${noteId}"
                 style="background:#4F46E5;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">
                 View Note
              </a>
              <p>Total Likes: ${totalLikes}</p>
              <br>
              <p style="font-size:0.9em;color:#777;">– The Wryta Team</p>
            </body>
          </html>`
        sendMail(email, subject, '', html)
      }

      return res.json({ success: true, message: 'Note liked' })
    }
  } catch (error) {
    console.error('Error in /note/:id/like:', error.message)
    res.status(500).send('Internal Server Error')
  }
})

// Increment share count
router.post('/note/:id/share', fetchuser, async (req, res) => {
  try {
    const noteId = req.params.id
    const userId = req.user?.id

    if (!noteId || !userId) {
      return res.status(400).json({ success: false, message: 'Invalid request data' })
    }

    const note = await Note.findById(noteId)
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' })

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    // ✅ Always increment share count
    await Note.findByIdAndUpdate(noteId, { $inc: { shares: 1 } })

    // ✅ Add userId to shares list only if not already present
    await Note.updateOne(
      { _id: noteId, 'actions.shares': { $ne: userId } },
      { $addToSet: { 'actions.shares': userId } }
    )

    // ✅ Add noteId to user's share actions
    await User.updateOne(
      { _id: userId, 'actions.shares': { $ne: noteId } },
      { $addToSet: { 'actions.shares': noteId } }
    )

    return res.json({ success: true, message: 'Note shared successfully' })
  } catch (error) {
    console.error('Error sharing note:', error.message)
    res.status(500).send('Internal Server Error')
  }
})

// Increment copy count
router.post('/note/:id/copy', fetchuser, async (req, res) => {
  try {
    const noteId = req.params.id
    const userId = req.user?.id

    if (!noteId || !userId) {
      return res.status(400).json({ success: false, message: 'Invalid request data' })
    }

    const note = await Note.findById(noteId)
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' })

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    // ✅ Always increment copy count
    await Note.findByIdAndUpdate(noteId, { $inc: { copies: 1 } })

    // ✅ Add userId to copies list only if not already there
    await Note.updateOne(
      { _id: noteId, 'actions.copies': { $ne: userId } },
      { $addToSet: { 'actions.copies': userId } }
    )

    // ✅ Add noteId to user's copy actions
    await User.updateOne(
      { _id: userId, 'actions.copies': { $ne: noteId } },
      { $addToSet: { 'actions.copies': noteId } }
    )

    return res.json({ success: true, message: 'Note copied successfully' })
  } catch (error) {
    console.error('Error copying note:', error.message)
    res.status(500).send('Internal Server Error')
  }
})

// Increment download count
router.post('/note/:id/download', fetchuser, async (req, res) => {
  try {
    const noteId = req.params.id
    const userId = req.user?.id

    if (!noteId || !userId) {
      return res.status(400).json({ success: false, message: 'Invalid request data' })
    }

    const note = await Note.findById(noteId)
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' })

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    // ✅ Always increase download count
    await Note.findByIdAndUpdate(noteId, { $inc: { downloads: 1 } })

    // ✅ Add userId to note's downloads (only if not already added)
    await Note.updateOne(
      { _id: noteId, 'actions.downloads': { $ne: userId } },
      { $addToSet: { 'actions.downloads': userId } }
    )

    // ✅ Add noteId to user's downloads (only if not already added)
    await User.updateOne(
      { _id: userId, 'actions.downloads': { $ne: noteId } },
      { $addToSet: { 'actions.downloads': noteId } }
    )

    return res.json({ success: true, message: 'Note downloaded successfully' })
  } catch (error) {
    console.error('Error downloading note:', error.message)
    res.status(500).send('Internal Server Error')
  }
})

router.get('/note/:id/likedetails', async (req, res) => {
  try {
    const noteId = req.params.id

    // 🧭 Find the note by ID
    const note = await Note.findById(noteId)
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' })
    }

    // 🧩 Extract user IDs from likes array
    const likingUserIds = note.actions.likes || []

    // 🧠 Fetch user details for all liked users
    const likingUsers = await User.find(
      { _id: { $in: likingUserIds } },
      'username name image' // Select only these fields
    )

    // 🪄 Format output if you want clean field names
    const formattedUsers = likingUsers.map(user => ({
      username: user.username,
      name: user.name,
      profilePic: user.image
    }))

    res.json({
      success: true,
      totalLikes: likingUserIds.length,
      users: formattedUsers
    })
  } catch (error) {
    console.error('Error fetching like details:', error.message)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
})

router.get('/fetchallnoteswithactions', fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id })
      .populate('actions.likes.userId', 'username name image')
      .populate('actions.shares.userId', 'username name image')
      .populate('actions.copies.userId', 'username name image')
      .populate('actions.downloads.userId', 'username name image')
    res.json(notes)
  } catch (error) {
    console.error('Error fetching notes with actions:', error.message)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
