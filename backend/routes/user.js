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
const { Canvas, FontLibrary } = require('skia-canvas')
const path = require('path')
const liveLink = process.env.REACT_APP_LIVE_LINK
const hostLink = process.env.REACT_APP_HOSTLINK

// Path logic: from /backend/routes/notes.js to /backend/fonts/
const fontsDir = path.join(__dirname, '../fonts')

try {
  /* ⭐ MAIN FONT (Hindi + English rendering also fine) */
  FontLibrary.use('WrytaFont', [
    path.join(fontsDir, 'NotoSansDevanagari_Condensed-Regular.ttf'),
    { path: path.join(fontsDir, 'NotoSansDevanagari_Condensed-Bold.ttf'), weight: 'bold' },
    { path: path.join(fontsDir, 'NotoSansDevanagari_Condensed-Medium.ttf'), weight: '500' }
  ])

  /* ⭐ EMOJI FALLBACK MUST BE SEPARATE */
  FontLibrary.use('EmojiFont', [
    path.join(fontsDir, 'NotoColorEmoji.ttf')
  ])

  console.log('🔥 Skia Fonts Loaded Correctly')
} catch (e) {
  console.error('❌ FONT LOAD FAILED', e)
}

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
        isPublic: note.isPublic,
        likes: note.likes,
        views: note.views,
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

// ROUTE: Generate OG Image for a User
router.get('/og-image/:username', async (req, res) => {
  const { username } = req.params

  try {
    const user = await User.findOne({
      username: { $regex: `^${username}$`, $options: 'i' }
    })
      .select('name username bio follower following')
      .lean()

    if (!user) return res.status(404).send('User not found')

    /* ✅ FAST COUNTS (no heavy filtering loop) */
    const totalNotes = await Note.countDocuments({ user: user._id })
    const publicNotes = await Note.countDocuments({
      user: user._id,
      isPublic: true
    })

    const followersCount = user.follower?.list?.length || 0
    const followingCount = user.following?.list?.length || 0

    const width = 1200
    const height = 630

    const canvas = new Canvas(width, height)
    const ctx = canvas.getContext('2d')

    /* ================= BACKGROUND ================= */
    const bg = ctx.createLinearGradient(0, 0, width, height)
    bg.addColorStop(0, '#020617')
    bg.addColorStop(1, '#0f172a')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)

    const glow = ctx.createRadialGradient(1000, 100, 50, 1000, 100, 600)
    glow.addColorStop(0, 'rgba(56,189,248,0.15)')
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, width, height)

    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'

    /* ================= BRAND ================= */
    ctx.font = '700 64px NotoSansDevanagari'

    let x = 80
    ctx.fillStyle = '#fff'
    ctx.fillText('Wry', x, 70)
    x += ctx.measureText('Wry').width

    ctx.fillStyle = '#FDC116'
    ctx.fillText('ta', x, 70)

    ctx.strokeStyle = 'rgba(56,189,248,0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(80, 155)
    ctx.lineTo(1120, 155)
    ctx.stroke()

    /* ================= NAME TITLE ================= */
    ctx.fillStyle = '#ffffff'
    ctx.font = '700 52px "WrytaFont","EmojiFont"'

    let name = (user.name || 'Wryta User')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    const maxNameWidth = 720

    while (ctx.measureText(name).width > maxNameWidth) {
      name = name.slice(0, -1)
    }

    ctx.fillText(name, 80, 210)

    /* ================= BIO WRAP (CHAR SMART) ================= */
    ctx.fillStyle = '#94a3b8'
    ctx.font = '400 32px "WrytaFont","EmojiFont"'

    const bio = user.bio || 'Read more from this user.'
    const maxWidth = 720
    const lineHeight = 48
    const startY = 290

    const lines = []
    const paragraphs = bio.split(/\r?\n/)

    for (const para of paragraphs) {
      const text = para.trim()

      if (!text) {
        lines.push('')
        continue
      }

      let line = ''

      for (const ch of text) {
        const test = line + ch

        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line)
          line = ch
        } else {
          line = test
        }
      }

      if (line) lines.push(line)
    }

    lines.slice(0, 4).forEach((l, i) => {
      if (i === 3 && lines.length > 4) l += '...'
      ctx.fillText(l, 80, startY + i * lineHeight)
    })

    /* ================= STATS GRID ================= */
    const statsX = 900
    const statsY = 240
    const gapX = 180
    const gapY = 120

    const drawStat = (label, value, x, y) => {
      ctx.textAlign = 'center'
      ctx.fillStyle = '#ffffff'
      ctx.font = '600 44px "WrytaFont","EmojiFont"'
      ctx.fillText(String(value), x, y)

      ctx.fillStyle = 'rgba(148,163,184,0.85)'
      ctx.font = '400 22px "WrytaFont","EmojiFont"'
      ctx.fillText(label.toUpperCase(), x, y + 48)
    }

    drawStat('Notes', totalNotes, statsX, statsY)
    drawStat('Public', publicNotes, statsX + gapX, statsY)
    drawStat('Followers', followersCount, statsX, statsY + gapY)
    drawStat('Following', followingCount, statsX + gapX, statsY + gapY)

    ctx.textAlign = 'left'

    /* ================= FOOTER ================= */
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(80, height - 110, 30, 4)

    ctx.fillStyle = '#f8fafc'
    ctx.font = '500 30px "WrytaFont","EmojiFont"'
    ctx.fillText(`@${user.username}`, 80, height - 70)

    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(148,163,184,0.5)'
    ctx.font = '400 24px "WrytaFont","EmojiFont"'
    ctx.fillText('wryta', 1120, height - 70)

    /* ================= EXPORT ================= */
    const buffer = await canvas.toBuffer('png')

    res.set('Content-Type', 'image/png')
    res.set('Cache-Control', 'public, max-age=86400')
    res.send(buffer)
  } catch (err) {
    console.error(err)
    res.status(500).send('Error generating OG image')
  }
})

module.exports = router
