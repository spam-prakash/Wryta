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
const { getIO, onlineUsers, emitNotification } = require('../socket')
const liveLink = process.env.REACT_APP_LIVE_LINK

router.get('/:username', fetchuser, async (req, res) => {
  try {
    const { username } = req.params
    // console.log(req.user.id)

    const user = await User.findOne({ username: { $regex: `^${username}$`, $options: 'i' } })
    if (!user) return res.status(404).json({ error: 'User Does Not Exists' })

    // Fetch notes of the user
    const notes = await Note.find({ user: user._id })

    // Fetch only public notes
    const publicNotes = notes.filter((note) => note.isPublic)
    // console.log(publicNotes)

    // Fetch follower details
    const followers = await User.find({ _id: { $in: user.follower.list } }).select('name username image')
    const following = await User.find({ _id: { $in: user.following.list } }).select('name username image')

    // Map to your response structure
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio || ' ',
      followerCount: followers.length,
      followingCount: following.length,
      followerList: followers.map(f => ({
        id: f._id,
        name: f.name,
        username: f.username,
        profilePic: f.image?.trim() || null
      })),
      followingList: following.map(f => ({
        id: f._id,
        name: f.name,
        username: f.username,
        profilePic: f.image?.trim() || null
      })),
      isFollowing: followers.some(f => String(f._id) === String(req.user.id)),
      profilePic: user.image?.trim() || null,
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
        publicDate: note.publicDate,
        likes: note.likes,
        copies: note.copies,
        downloads: note.downloads,
        shares: note.shares,
        actions: note.actions
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
    const userId = req.params.userId // person being followed
    const followerId = req.user.id // logged-in user

    if (userId === followerId) {
      return res.status(400).json({ error: 'You cannot follow yourself.' })
    }

    const user = await User.findById(userId)
    const follower = await User.findById(followerId)

    if (!user || !follower) {
      return res.status(404).json({ error: 'User not found' })
    }

    // ✅ Already following check
    const alreadyFollowing = user.follower.list.some(
      id => id.toString() === followerId.toString()
    )

    if (alreadyFollowing) {
      return res.status(400).json({ error: 'Already following this user.' })
    }

    // ✅ Update DB
    await User.findByIdAndUpdate(userId, {
      $addToSet: { 'follower.list': followerId },
      $inc: { 'follower.count': 1 }
    })

    await User.findByIdAndUpdate(followerId, {
      $addToSet: { 'following.list': userId },
      $inc: { 'following.count': 1 }
    })

    const Notification = require('../models/Notification')

    // --------------------------------------------
    // 🔔 CREATE FOLLOW NOTIFICATION
    // --------------------------------------------
    if (userId.toString() !== followerId.toString()) {
      const notification = await Notification.create({
        user: userId, // receiver
        sender: followerId, // actor
        type: 'follow',
        redirectType: 'user',
        redirectId: req.user.id,
        message: 'started following you'
      })

      // --------------------------------------------
      // ⚡ REAL-TIME SOCKET EMIT
      // --------------------------------------------
      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'name username image') // populate sender info

      emitNotification(notification.user, populatedNotification)
    }

    res.json({ success: true, message: 'Followed successfully' })
  } catch (error) {
    console.error('Error in /follow route:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.post('/unfollow/:userId', fetchuser, async (req, res) => {
  try {
    const userId = req.params.userId
    const followerId = req.user.id

    const user = await User.findById(userId)
    const follower = await User.findById(followerId)

    if (!user || !follower) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Remove followerId from user's follower list
    user.follower.list = user.follower.list.filter(f => String(f) !== String(followerId))
    user.follower.count = user.follower.list.length

    // Remove userId from follower's following list
    follower.following.list = follower.following.list.filter(f => String(f) !== String(userId))
    follower.following.count = follower.following.list.length

    await user.save()
    await follower.save()

    res.json({ success: true, message: 'Unfollowed successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.get('/:userId/followers', async (req, res) => {
  try {
    const userId = req.params.userId
    const user = await User.findById(userId)

    if (!user) return res.status(404).json({ error: 'User not found' })

    // Fetch follower details
    const followersData = await User.find({ _id: { $in: user.follower.list } }).select('username name image')

    // Map to the old response structure
    const followers = followersData.map(f => ({
      name: f.name,
      username: f.username,
      profilePic: f.image
    }))

    res.json({
      followers,
      count: user.follower.count
    })
  } catch (error) {
    console.error('Error fetching followers:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.get('/:userId/following', async (req, res) => {
  try {
    const userId = req.params.userId
    const user = await User.findById(userId)

    if (!user) return res.status(404).json({ error: 'User not found' })

    // Fetch following details from stored user IDs
    const followingData = await User.find({ _id: { $in: user.following.list } }).select('username name image')

    // Map to old response structure
    const following = followingData.map(f => ({
      name: f.name,
      username: f.username,
      profilePic: f.image
    }))

    res.json({
      following,
      count: user.following.count
    })
  } catch (error) {
    console.error('Error fetching following:', error.message)
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
