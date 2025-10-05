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

router.get('/:username', fetchuser, async (req, res) => {
  try {
    const { username } = req.params
    // console.log(req.user.id)

    const user = await User.findOne({ username })
    if (!user) return res.status(404).json({ error: 'User Does Not Exists' })

    // Fetch notes of the user
    const notes = await Note.find({ user: user._id })

    // Fetch only public notes
    const publicNotes = notes.filter((note) => note.isPublic)
    // console.log(publicNotes)

    const userData = {
      id: user.id, // manual id
      name: user.name,
      email: user.email,
      username: user.username,
      followerCount: user.follower.count,
      followingCount: user.following.count,
      followerList: user.follower.list.map(f => f._id || f),
      followingList: user.following.list.map(f => f._id || f),
      isFollowing: user.follower.list.some(
        f => String(f._id || f) === String(req.user.id)
      ),
      profilePic: user.image?.trim() ? user.image : null,
      totalNotes: notes.length,
      publicNotesCount: publicNotes.length,
      likesCount: user.actions.likes.length,
      publicNotes: publicNotes.map(note => ({
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

    res.json(userData)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.post('/follow/:userId', fetchuser, async (req, res) => {
  try {
    const userId = req.params.userId // ID of the user to follow
    const followerId = req.user.id // ID of the logged-in user

    const user = await User.findById(userId)
    const userMail = user.email
    const userName = user.name
    const follower = await User.findById(followerId)
    const followerMail = follower.email
    const followerName = follower.name
    const followerUserName = follower.username

    if (!user || !follower) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Add follower to the user's follower list
    if (!user.follower.list.includes(followerId)) {
      user.follower.list.push(followerId)
      user.follower.count += 1
      const followerCount = user.follower.count
      const subject = `${followerName} just followed you!`
      const text = ''
      const html = `<!DOCTYPE html>
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <h2>You just got a new follower!</h2>
                  <p>Hi <strong>${userName}</strong>,</p>
                  <p><strong>${followerName}</strong> just started following you on <strong>Wryta</strong>.</p>
                  <a href="${liveLink}/${followerUserName}" 
                  style="background:#4F46E5;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">
                  View Profile
                  </a>
                  <p>You now have <strong>${followerCount}</strong> followers. </p>
                  <p>Keep sharing your notes and inspiring others!</p>
                  <br>
                  <p style="font-size: 0.9em; color: #777;">
                    – The Wryta Team
                  </p>
                </body>
              </html>
              `

      sendMail(userMail, subject, text, html)
    }

    // Add user to the follower's following list
    if (!follower.following.list.includes(userId)) {
      follower.following.list.push(userId)
      follower.following.count += 1
      // const subject = 'You just followed.'
      // const text = ''
      // const html = ''
      // sendMail(followerMail, subject)
    }

    await user.save()
    await follower.save()

    res.json({ success: true, message: 'Followed successfully' })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.post('/unfollow/:userId', fetchuser, async (req, res) => {
  try {
    const userId = req.params.userId // ID of the user to unfollow
    const followerId = req.user.id // ID of the logged-in user

    const user = await User.findById(userId)
    const follower = await User.findById(followerId)

    if (!user || !follower) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Remove follower from the user's follower list
    user.follower.list = user.follower.list.filter((id) => id.toString() !== followerId.toString())
    user.follower.count -= 1

    // Remove user from the follower's following list
    follower.following.list = follower.following.list.filter((id) => id.toString() !== userId.toString())
    follower.following.count -= 1

    await user.save()
    await follower.save()

    res.json({ success: true, message: 'Unfollowed successfully' })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.get('/:userId/followers', async (req, res) => {
  try {
    const userId = req.params.userId

    const user = await User.findById(userId).populate('follower.list', 'username name email')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ followers: user.follower.list, count: user.follower.count })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.get('/:userId/following', async (req, res) => {
  try {
    const userId = req.params.userId

    const user = await User.findById(userId).populate('following.list', 'username name email')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ following: user.following.list, count: user.following.count })
  } catch (error) {
    console.error(error.message)
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
