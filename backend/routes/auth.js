const express = require('express')
const User = require('../models/User')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const fetchuser = require('../middleware/fetchUser')
const fetchuser = require('../middleware/fetchuser');
//  ngjfn

const JWT_SCREAT = process.env.JWTSIGN
// const JWT_SCREAT = 'heygoogleremindmrmetowatertheplant'

// ROUTE 1: Create a user using: POST "/api/auth/createuser" NO LOGIN REQUIRE
router.post('/createuser', [
  body('username', 'Enter a valid username').isLength({ min: 5 }),
  body('name', 'Enter a valid name').isLength({ min: 5 }),
  body('email', 'Enter a valid Email').isEmail(),
  body('password', 'Enter a valid password').isLength({ min: 5 })
], async (req, res) => {
  let success = false
  // IF there are errors, return 400 BAD request nad error
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() })
  }
  try {
    // Check if a user with the same email already exists
    let user = await User.findOne({ email: req.body.email })
    if (user) {
      return res.status(400).json({ success, error: 'A user with this email already exists' })
    }
    user = await User.findOne({ username: req.body.username })
    if (user) {
      return res.status(400).json({ success, error: 'A user with this username already exists' })
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const secPass = await bcrypt.hash(req.body.password, salt)

    // Create the new user
    user = await User.create({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      password: secPass
    })

    const data = {
      user: {
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SCREAT)
    // console.log(jwtData)

    // res.json(user);
    success = true
    res.json({ success, authToken })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
  // .then(user=>res.json(user)).catch((err)=>{console.log(err),res.json({error:"Please enter a unique value"})})
})

// ROUTE 2: Authenticate user POST: "api/auth/login" NO LOGIN REQUIRE

router.post('/login', [
  body('username', 'Enter a valid username').isLength({ min: 5 }),
  body('password', 'Enter a valid password').isLength({ min: 5 })
], async (req, res) => {
  let success = false
  // IF there are errors, return 400 BAD request nad error
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { username, password } = req.body
  try {
    const user = await User.findOne({ username })
    if (!user) {
      success = false
      // return res.status(400).json({error:"Sorry user does not exists"})
      return res.status(400).json({ success, error: 'Please try to login with correct credentials' })
    }

    const passwordCompare = await bcrypt.compare(password, user.password)
    if (!passwordCompare) {
      success = false
      // return res.status(400).json({error:"Sorry user does not exists"})
      return res.status(400).json({ success, error: 'Please try to login with correct credentials' })
    }

    const data = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }

    console.log(data)

    const authToken = jwt.sign(data, JWT_SCREAT)
    success = true
    res.json({ success, authToken, name: user.name, email: user.email })
    // console.log("Logged in successfully")
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE 3: GET LOGGEDIN USER DETAILS POST: "/api/auth/getuser" LOGIN REQUIRE
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

module.exports = router
