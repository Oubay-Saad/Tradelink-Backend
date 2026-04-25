const express = require("express")

const User = require("../models/User")
const Post = require("../models/Post")
const Service = require("../models/Service")
const Request = require("../models/Request")
const Review = require("../models/Review")

const { auth, isAdmin } = require("../middleware/auth")

const router = express.Router()

// ─────────────────────────────────────────────
//  PROTECT ALL ADMIN ROUTES
// ─────────────────────────────────────────────
router.use(auth)
router.use(isAdmin)


// ─────────────────────────────────────────────
//  USERS MANAGEMENT
// ─────────────────────────────────────────────

// Get all users
router.get("/admin/users", async (req, res) => {
    const users = await User.find().select("-password")
    res.json(users)
})

// Get single user
router.get("/admin/users/:id", async (req, res) => {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) return res.status(404).json({ error: "User not found" })

    res.json(user)
})

// Delete user
router.delete("/admin/users/:id", async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ error: "User not found" })

    res.json({ message: "User deleted" })
})


// ─────────────────────────────────────────────
//  POSTS MANAGEMENT
// ─────────────────────────────────────────────

// Get all posts
router.get("/admin/posts", async (req, res) => {
    const posts = await Post.find().populate("postedBy", "name email")
    res.json(posts)
})

// Delete post
router.delete("/admin/posts/:id", async (req, res) => {
    const post = await Post.findByIdAndDelete(req.params.id)
    if (!post) return res.status(404).json({ error: "Post not found" })

    res.json({ message: "Post deleted" })
})


// ─────────────────────────────────────────────
//  SERVICES MANAGEMENT
// ─────────────────────────────────────────────

// Get all services
router.get("/admin/services", async (req, res) => {
    const services = await Service.find().populate("createdBy", "name email")
    res.json(services)
})

// Delete service
router.delete("/admin/services/:id", async (req, res) => {
    const service = await Service.findByIdAndDelete(req.params.id)
    if (!service) return res.status(404).json({ error: "Service not found" })

    res.json({ message: "Service deleted" })
})


// ─────────────────────────────────────────────
//  REQUESTS MANAGEMENT
// ─────────────────────────────────────────────

// Get all requests
router.get("/admin/requests", async (req, res) => {
    const requests = await Request.find()
        .populate("service")
        .populate("requestedBy", "name email")

    res.json(requests)
})

// Delete request
router.delete("/admin/requests/:id", async (req, res) => {
    const request = await Request.findByIdAndDelete(req.params.id)
    if (!request) return res.status(404).json({ error: "Request not found" })

    res.json({ message: "Request deleted" })
})


// ─────────────────────────────────────────────
//  REVIEWS MANAGEMENT
// ─────────────────────────────────────────────

// Get all reviews
router.get("/admin/reviews", async (req, res) => {
    const reviews = await Review.find()
        .populate("tradesman", "name")
        .populate("customer", "name")

    res.json(reviews)
})

// Delete review
router.delete("/admin/reviews/:id", async (req, res) => {
    const review = await Review.findByIdAndDelete(req.params.id)
    if (!review) return res.status(404).json({ error: "Review not found" })

    res.json({ message: "Review deleted" })
})


module.exports = router