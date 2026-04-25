const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { OAuth2Client } = require("google-auth-library")
const Usertest = require("../test files/Usertest")

const router = express.Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// ─── Helper ───────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, "SECRET_KEY", { expiresIn: "7d" })

// ─── Register ─────────────────────────────────────────────
router.post("/auth/register", async (req, res) => {
  try {
    const { name, phone, email, role, password } = req.body

    const hashedPass = await bcrypt.hash(password, 10)

    const newUser = new User({ name, phone, email, role, password: hashedPass })
    await newUser.save()

    res.status(201).json({ message: "Account created", user: newUser })
  } catch (err) {
    console.error(err)
    if (err.code === 11000) return res.status(400).json({ error: "User already exists" })
    res.status(500).json({ error: "Server error" })
  }
})

// ─── Login ────────────────────────────────────────────────
router.post("/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body

    const user = await User.findOne({ phone })
    if (!user) return res.status(400).json({ error: "User not found" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ error: "Invalid password" })

    const token = signToken(user)
    res.json({ message: "Login successful", token, user })
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

// ─── Google OAuth ─────────────────────────────────────────
router.post("/auth/google", async (req, res) => {
  try {
    const { idToken, role } = req.body

    if (!idToken) return res.status(400).json({ error: "idToken is required" })

    // Verify the token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const { sub: googleId, email, name, picture } = ticket.getPayload()

    // Find existing user or create a new one
    let user = await User.findOne({ googleId })

    if (!user) {
      // New user — role is required on first sign-up
      if (!role) return res.status(400).json({ error: "role is required for new users" })

      user = new User({
        name,
        email,
        googleId,
        avatar: picture,
        role,
        // phone & password are left empty for OAuth users
      })
      await user.save()
    }

    const token = signToken(user)
    res.json({ message: "Google login successful", token, user })
  } catch (err) {
    console.error(err)
    if (err.message?.includes("Token used too late") || err.message?.includes("Invalid token")) {
      return res.status(401).json({ error: "Invalid or expired Google token" })
    }
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router