const express = require('express')
const router = express.Router()
const Notification = require('../models/Notification')
const fetchuser = require('../middleware/fetchuser')

/**
 * ROUTE 1: Get all notifications for logged-in user
 * METHOD: GET
 * URL: /api/notification
 * LOGIN REQUIRED
 */
router.get('/', fetchuser, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('sender', 'name username image')
      .populate('note', 'title')
      .sort({ createdAt: -1 })

    res.json(notifications)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

/**
 * ROUTE 2: Get unread notifications count
 * METHOD: GET
 * URL: /api/notification/unread-count
 * LOGIN REQUIRED
 */
router.get('/unread-count', fetchuser, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    })

    res.json({ unreadCount: count })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

/**
 * ROUTE 3: Mark notification as read
 * METHOD: PUT
 * URL: /api/notification/read/:id
 * LOGIN REQUIRED
 */
router.put('/read/:id', fetchuser, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    // ❗ Security check
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not allowed' })
    }

    notification.isRead = true
    await notification.save()

    res.json({ success: true, notification })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

/**
 * ROUTE 4: Mark all notifications as read
 * METHOD: PUT
 * URL: /api/notification/read-all
 * LOGIN REQUIRED
 */
router.put('/read-all', fetchuser, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    )

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
