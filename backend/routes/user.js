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
const { createCanvas, registerFont } = require('canvas')
const path = require('path')
const liveLink = process.env.REACT_APP_LIVE_LINK
const hostLink = process.env.REACT_APP_HOSTLINK

// Path logic: from /backend/routes/notes.js to /backend/fonts/
const fontsDir = path.join(__dirname, '../fonts')

try {
  // Use unique names that DON'T overlap with system font names or keywords
  registerFont(path.join(fontsDir, 'NotoSansDevanagari_Condensed-Regular.ttf'), {
    family: 'WrytaMainRegular'
  })

  registerFont(path.join(fontsDir, 'NotoSansDevanagari_Condensed-Bold.ttf'), {
    family: 'WrytaMainBold'
  })

  registerFont(path.join(fontsDir, 'NotoSansDevanagari_Condensed-Medium.ttf'), {
    family: 'WrytaMainMedium'
  })

  registerFont(path.join(fontsDir, 'NotoColorEmoji.ttf'), { family: 'EmojiFont' })

  console.log('🔥 OG Fonts Registered Successfully')
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
    const user = await User.findOne({ username: { $regex: `^${username}$`, $options: 'i' } }).select('name username bio notes follower following')
    if (!user) return res.status(404).send('User not found')
    // console.log(user)

    const notes = await Note.find({ user: user._id })
    const totalNotes = notes.length
    const publicNotes = notes.filter((note) => note.isPublic).length
    const followersCount = await user.follower.list.length
    const followingCount = await user.following.list.length

    const width = 1200
    const height = 630
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // 1. Background & Aesthetic Glow
    const bg = ctx.createLinearGradient(0, 0, width, height)
    bg.addColorStop(0, '#020617')
    bg.addColorStop(1, '#0f172a')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)

    const glow = ctx.createRadialGradient(1000, 100, 50, 1000, 100, 600)
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.15)')
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, width, height)

    // 2. Header Branding
    ctx.font = 'bold 64px sans-serif'; ctx.textBaseline = 'top'
    let curX = 80;
    [['Wry', '#fff'], ['ta', '#FDC116']].forEach(([txt, col]) => {
      ctx.fillStyle = col; ctx.fillText(txt, curX, 70)
      curX += ctx.measureText(txt).width
    })

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)'; ctx.lineWidth = 1; ctx.beginPath()
    ctx.moveTo(80, 160); ctx.lineTo(1120, 140); ctx.stroke()

    // 3. TITLE: Using WrytaMainBold (No 'bold' keyword)
    ctx.fillStyle = '#ffffff'
    const maxTitleWidth = 720
    const titleY = 200
    ctx.font = '48px WrytaMainBold'

    let titleText = (user.name).replace(/\r?\n/g, ' ')

    if (ctx.measureText(titleText).width > maxTitleWidth) {
      while (ctx.measureText(titleText + '...').width > maxTitleWidth && titleText.length > 0) {
        titleText = titleText.slice(0, -1)
      }
      titleText += '...'
    }
    ctx.fillText(titleText, 80, titleY)

    // 4. Bio: Using WrytaMainRegular
    ctx.fillStyle = '#94a3b8'
    ctx.font = '32px EmojiFont, WrytaMainRegular'
    const maxDescWidth = 720
    const descLineHeight = 48
    const descStartY = 280

    const rawParagraphs = (user.bio || 'Read more from this user.').split(/\r?\n/)
    let descLines = []

    for (const p of rawParagraphs) {
      const words = p.split(' '); let currentLine = ''
      for (const word of words) {
        const testLine = currentLine + word + ' '
        if (ctx.measureText(testLine).width > maxDescWidth && currentLine !== '') {
          descLines.push(currentLine.trim())
          currentLine = word + ' '
        } else {
          currentLine = testLine
        }
      }
      if (currentLine.trim()) descLines.push(currentLine.trim())
    }

    if (descLines.length > 4) {
      descLines = descLines.slice(0, 4)
      descLines[3] = descLines[3].replace(/\s+$/, '') + '...'
    }

    descLines.forEach((line, i) => {
      ctx.fillText(line, 80, descStartY + (i * descLineHeight))
    })

    /// --- 5. STATS GRID (X > 750, 2 Rows) ---
    const statsX = 850 // Moved slightly right to center the block
    const statsYStart = 230
    const colGap = 180 // Space between columns
    const rowGap = 110 // Space between rows

    const drawStat = (label, value, x, y) => {
      ctx.textAlign = 'center' // This ensures both label and value align at the center X

      // 1. Draw Value (Large & White)
      ctx.fillStyle = '#ffffff'
      ctx.font = '42px WrytaMainMedium'
      ctx.fillText(value.toString(), x, y)

      // 2. Draw Label (Small, Muted, & All Caps)
      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)'
      ctx.font = '22px WrytaMainRegular'
      // Placed below the value for that modern "dashboard" look
      ctx.fillText(label.toUpperCase(), x, y + 45)
    }

    // Row 1: Notes Stats
    drawStat('Notes', totalNotes, statsX, statsYStart)
    drawStat('Public', publicNotes, statsX + colGap, statsYStart)

    // Row 2: Social Stats
    drawStat('Followers', followersCount, statsX, statsYStart + rowGap)
    drawStat('Following', followingCount, statsX + colGap, statsYStart + rowGap)

    // IMPORTANT: Reset textAlign to 'left' so footer text doesn't break
    ctx.textAlign = 'left'

    // 6. FOOTER: Using WrytaMainMedium
    if (user.username) {
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(80, height - 115, 30, 4)
      ctx.fillStyle = '#f8fafc'
      ctx.font = '30px WrytaMainMedium'
      ctx.fillText(`@${user.username}`, 80, height - 70)
    }

    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'
    ctx.font = '30px WrytaMainMedium'
    ctx.fillText('Wryta', 1040, height - 70)

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    canvas.createPNGStream().pipe(res)
  } catch (err) {
    console.error(err)
    res.status(500).send('Error generating OG image')
  }
})

module.exports = router
