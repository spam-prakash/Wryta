const express = require('express')
const User = require('../models/User')
const Note = require('../models/Note') // Ensure the correct path
const router = express.Router()
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser')
const sendMail = require('./mailer')
const otpGenerator = require('otp-generator')
const crypto = require('crypto')

const liveLink = process.env.REACT_APP_LIVE_LINK
const JWT_SECRET = process.env.JWTSIGN

// Store OTPs temporarily (in-memory storage for simplicity)
const otpStore = {}

// Update resetTokenStore to store multiple tokens with expiry
const resetTokenStore = {} // Example: { email: [{ token: '...', expiresAt: 1234567890 }, ...] }

// ROUTE 1: Generate OTP and send to email
router.post('/generateotp', [
  body('email', 'Enter a valid Email').isEmail()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email } = req.body

  const otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false
  })

  otpStore[email] = otp

  const subject = 'Your OTP for wryta Signup'
  const text = `Your OTP for signing up on wryta is ${otp}. It is valid for 10 minutes.`
  const html = `<p>Your OTP for signing up on wryta is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`

  try {
    await sendMail(email, subject, text, html)

    return res.json({
      success: true,
      message: 'OTP sent to email'
    })
  } catch (error) {
    console.error('Error sending mail:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    })
  }
})

// ROUTE 2: Create a user using: POST "/api/auth/createuser" NO LOGIN REQUIRE
router.post('/createuser', [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[A-Za-z0-9_.-]+$/)
    .withMessage('Only letter, Numbers, _-. are allowed'),
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid Email').isEmail(),
  body('password', 'Enter a valid password').isLength({ min: 5 }),
  body('otp', 'Enter a valid OTP').isLength({ min: 6, max: 6 })
], async (req, res) => {
  let success = false
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() })
  }

  const { username, name, email, password, otp } = req.body

  // Verify OTP
  if (otpStore[email] !== otp) {
    return res.status(400).json({ success: false, error: 'Invalid OTP' })
  }

  try {
    let user = await User.findOne({ username: { $regex: `^${email}$`, $options: 'i' } })
    if (user) {
      return res.status(400).json({ success: false, error: 'A user with this username already exists' })
    }
    user = await User.findOne({ username: { $regex: `^${username}$`, $options: 'i' } })
    if (user) {
      return res.status(400).json({ success: false, error: 'A user with this username already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const secPass = await bcrypt.hash(password, salt)

    user = await User.create({
      username,
      name,
      email,
      password: secPass
    })

    const data = {
      user: {
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET)
    success = true
    res.json({ success, authToken })

    const subject = 'Welcome to wryta'
    const text = `Hello ${user.name},\n\nThank you for signing up for wryta. We are excited to have you on board!\n\nBest regards,\nThe wryta Team`
    const html = `<p>Hello ${user.name},</p><p>Thank you for signing up for wryta. We are excited to have you on board!</p><p>Best regards,<br>The wryta Team</p>`
    const result = await sendMail(email, subject, text, html)

    if (!result.success) {
      console.error('Email failed:', result.error)
      return res.status(200).json({
        success: false,
        message: 'OTP generated but sending email failed',
        error: result.error
      })
    }

    res.json({ success: true, message: 'OTP sent to email' })

    // Clear OTP from store
    delete otpStore[email]
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE 3: Authenticate user POST: "api/auth/login" NO LOGIN REQUIRE
router.post('/login', [
  body('identifier', 'Enter a valid email or username').notEmpty(),
  body('password', 'Password cannot be blank').exists()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { identifier, password } = req.body

  try {
    // Check if the identifier is an email or username
    const user = await User.findOne({
      $or: [
        { email: { $regex: `^${identifier}$`, $options: 'i' } },
        { username: { $regex: `^${identifier}$`, $options: 'i' } }
      ]
    })

    if (!user) {
      return res.status(400).json({ error: 'Invalid Credentials' })
    }

    const passwordCompare = await bcrypt.compare(password, user.password)
    if (!passwordCompare) {
      return res.status(400).json({ error: 'Invalid Credentials' })
    }

    const data = {
      user: {
        id: user.id
      }
    }

    const authToken = jwt.sign(data, JWT_SECRET)
    res.json({
      success: true,
      authToken,
      email: user.email,
      name: user.name,
      image: user.image,
      username: user.username, // ✅ add this
      id: user._id // optional but useful
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE 4: GET LOGGEDIN USER DETAILS POST: "/api/auth/getuser" LOGIN REQUIRE
router.post('/getuser', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).select('-password')
    res.send(user)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE: Request Password Reset
router.post('/request-reset-password', [
  body('email', 'Enter a valid Email').isEmail()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    return res.status(400).json({ error: 'No user found with this email' })
  }

  const resetToken = crypto.randomBytes(32).toString('hex')
  const expiresAt = Date.now() + 15 * 60 * 1000 // Token valid for 15 minutes

  // Add the new token to the resetTokenStore
  if (!resetTokenStore[email]) {
    resetTokenStore[email] = []
  }
  resetTokenStore[email].push({ token: resetToken, expiresAt })

  const resetLink = `${liveLink}/reset-password?token=${resetToken}&email=${email}`
  const subject = 'Password Reset Request'
  const text = `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`
  const html = `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, please ignore this email.</p>`

  try {
    const result = await sendMail(email, subject, text, html)

    if (!result.success) {
      console.error('Email failed:', result.error)
      return res.status(200).json({
        success: false,
        message: 'OTP generated but sending email failed',
        error: result.error
      })
    }

    res.json({ success: true, message: 'OTP sent to email' })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE: Reset Password
router.post('/reset-password', [
  body('email', 'Enter a valid Email').isEmail(),
  body('token', 'Token is required').notEmpty(),
  body('password', 'Enter a valid password').isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, token, password } = req.body

  // Check if the token exists and is valid
  if (!resetTokenStore[email]) {
    return res.status(400).json({ error: 'Invalid or expired token' })
  }

  const validTokenIndex = resetTokenStore[email].findIndex(
    (entry) => entry.token === token && entry.expiresAt > Date.now()
  )

  if (validTokenIndex === -1) {
    return res.status(400).json({ error: 'Invalid or expired token' })
  }

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: 'No user found with this email' })
    }

    const salt = await bcrypt.genSalt(10)
    const secPass = await bcrypt.hash(password, salt)

    user.password = secPass
    await user.save()

    // Remove the used token from the store
    resetTokenStore[email].splice(validTokenIndex, 1)

    res.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE: Update User Profile
router.put('/updateprofile', fetchuser, [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[A-Za-z0-9_.-]+$/)
    .withMessage('Only letter, Numbers, _-. are allowed'),
  body('name', 'Enter a valid name').isLength({ min: 3 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { username, name, bio } = req.body
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const existingUser = await User.findOne({ username: { $regex: `^${username}$`, $options: 'i' }, _id: { $ne: user._id } })
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Username already taken' })
    }

    user.username = username
    user.name = name
    user.bio = bio
    await user.save()

    res.json({ success: true, user })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
