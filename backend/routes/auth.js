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

// Store reset tokens temporarily (in-memory storage for simplicity)
const resetTokenStore = {}

// ROUTE 1: Generate OTP and send to email
router.post('/generateotp', [
  body('email', 'Enter a valid Email').isEmail()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email } = req.body
  const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
  otpStore[email] = otp

  const subject = 'Your OTP for iNotebook Signup'
  const text = `Your OTP for signing up on iNotebook is ${otp}. It is valid for 10 minutes.`
  const html = `<p>Your OTP for signing up on iNotebook is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`

  try {
    await sendMail(email, subject, text, html)
    res.json({ success: true, message: 'OTP sent to email' })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE 2: Create a user using: POST "/api/auth/createuser" NO LOGIN REQUIRE
router.post('/createuser', [
  body('username', 'Enter a valid username').isLength({ min: 5 }),
  body('name', 'Enter a valid name').isLength({ min: 5 }),
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
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ success: false, error: 'A user with this email already exists' })
    }
    user = await User.findOne({ username })
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

    const subject = 'Welcome to iNotebook'
    const text = `Hello ${user.name},\n\nThank you for signing up for iNotebook. We are excited to have you on board!\n\nBest regards,\nThe iNotebook Team`
    const html = `<p>Hello ${user.name},</p><p>Thank you for signing up for iNotebook. We are excited to have you on board!</p><p>Best regards,<br>The iNotebook Team</p>`
    await sendMail(user.email, subject, text, html)

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
        { email: identifier },
        { username: identifier }
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
    res.json({ success: true, authToken, email: user.email, name: user.name })
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
  resetTokenStore[email] = resetToken

  const resetLink = `${liveLink}/reset-password?token=${resetToken}&email=${email}`
  const subject = 'Password Reset Request'
  const text = `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`
  const html = `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, please ignore this email.</p>`

  try {
    await sendMail(email, subject, text, html)
    res.json({ success: true, message: 'Password reset link sent to email' })
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

  if (resetTokenStore[email] !== token) {
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

    // Clear reset token from store
    delete resetTokenStore[email]

    res.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE: Update User Profile
router.put('/updateprofile', fetchuser, [
  body('username', 'Enter a valid username').isLength({ min: 5 }),
  body('name', 'Enter a valid name').isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { username, name } = req.body
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    user.username = username
    user.name = name
    await user.save()

    res.json({ success: true, user })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
