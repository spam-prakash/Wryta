const express = require('express')
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../utils/cloudinary')
const fetchuser = require('../middleware/fetchuser')
const User = require('../models/User')

const router = express.Router()

// Configure multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'wryta_uploads', // Folder name on your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
})

const upload = multer({ storage })

// Upload route
router.post('/image', fetchuser, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' })
    }

    const imageUrl = req.file.path // Cloudinary returns this permanent URL

    // Example: store image URL in user's profile
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { image: imageUrl },
      { new: true }
    )

    res.json({
      success: true,
      imageUrl,
      userImage: user.image
    })
  } catch (error) {
    console.error('❌ Upload error:', error)
    res.status(500).json({ success: false, message: 'Image upload failed' })
  }
})

module.exports = router
