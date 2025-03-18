const express = require('express')
const User = require('../models/User')
const Note = require("../models/Note"); // Ensure the correct path
const router = express.Router()
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const fetchuser = require('../middleware/fetchUser')
const fetchuser = require('../middleware/fetchuser');


router.get("/:username", async (req, res) => {
    try {
        const { username } = req.params;

        // Find user by username
        const user = await User.findOne({ username });

        if (!user) {
            console.log(`User not found: ${username}`);
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch notes of the user
        const notes = await Note.find({ user: user._id });

        // Fetch only public notes
        const publicNotes = notes.filter((note) => note.isPublic);

        // Prepare user data response
        const userData = {
            name: user.name,
            email: user.email,
            profilePic: user.image?.trim() ? user.image : null,
            totalNotes: notes.length,
            publicNotesCount: publicNotes.length,
            publicNotes: publicNotes.map((note) => ({
                _id: note._id,
                title: note.title,
                tag: note.tag,
                description: note.description,
                createdAt: note.date,
                modifiedAt: note.modifiedDate, // ✅ Include modifiedAt
            })),
        };
        console.log("User data:", userData);

        res.json(userData);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



module.exports = router