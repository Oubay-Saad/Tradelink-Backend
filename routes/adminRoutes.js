const express = require("express")

const User = require("../models/User")
const Post = require("../models/Post")
const Service = require("../models/Service")
const Request = require("../models/Request")
const Review = require("../models/Review")

const { auth, isAdmin } = require("../middleware/auth")

const router = express.Router()

// protect everything
router.use(auth)
router.use(isAdmin)


// ─────────────────────────────────────────────
// 👤 USERS
// ─────────────────────────────────────────────

// GET ALL USERS (KEEP YOUR ORIGINAL)
router.get("/admin/users", async (req, res) => {
    const users = await User.find().select("-password")
    res.json(users)
})

// GET ONE USER
router.get("/admin/users/:id", async (req, res) => {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) return res.status(404).json({ error: "User not found" })
    res.json(user)
})

// ➕ CREATE USER (NEW)
router.post("/admin/users", async (req, res) => {
    const user = await User.create(req.body)
    res.json(user)
})

// ✏️ UPDATE USER (NEW)
router.patch("/admin/users/:id", async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    ).select("-password")

    if (!user) return res.status(404).json({ error: "User not found" })

    res.json(user)
})

// ❌ DELETE USER
router.delete("/admin/users/:id", async (req, res) => {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: "User deleted" })
})


// ─────────────────────────────────────────────
// 📝 POSTS
// ─────────────────────────────────────────────

// GET ALL POSTS (KEEP)
router.get("/admin/posts", async (req, res) => {
    const posts = await Post.find().populate("postedBy", "name email")
    res.json(posts)
})

// GET ONE POST
router.get("/admin/posts/:id", async (req, res) => {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: "Post not found" })
    res.json(post)
})

// ➕ CREATE POST
router.post("/admin/posts", async (req, res) => {
    const post = await Post.create(req.body)
    res.json(post)
})

// ✏️ UPDATE POST
router.patch("/admin/posts/:id", async (req, res) => {
    const post = await Post.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    )

    if (!post) return res.status(404).json({ error: "Post not found" })

    res.json(post)
})

// ❌ DELETE POST
router.delete("/admin/posts/:id", async (req, res) => {
    await Post.findByIdAndDelete(req.params.id)
    res.json({ message: "Post deleted" })
})


// ─────────────────────────────────────────────
// 🛠️ SERVICES
// ─────────────────────────────────────────────

// GET ALL SERVICES (KEEP)
router.get("/admin/services", async (req, res) => {
    const services = await Service.find().populate("createdBy", "name email")
    res.json(services)
})

// GET ONE SERVICE
router.get("/admin/services/:id", async (req, res) => {
    const service = await Service.findById(req.params.id)
    if (!service) return res.status(404).json({ error: "Service not found" })
    res.json(service)
})

// ➕ CREATE SERVICE
router.post("/admin/services", async (req, res) => {
    const service = await Service.create(req.body)
    res.json(service)
})

// ✏️ UPDATE SERVICE
router.patch("/admin/services/:id", async (req, res) => {
    const service = await Service.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    )

    if (!service) return res.status(404).json({ error: "Service not found" })

    res.json(service)
})

// ❌ DELETE SERVICE
router.delete("/admin/services/:id", async (req, res) => {
    await Service.findByIdAndDelete(req.params.id)
    res.json({ message: "Service deleted" })
})


// ─────────────────────────────────────────────
// 📩 REQUESTS
// ─────────────────────────────────────────────

// GET ALL REQUESTS (KEEP)
router.get("/admin/requests", async (req, res) => {
    const requests = await Request.find()
        .populate("service")
        .populate("requestedBy", "name email")

    res.json(requests)
})

// UPDATE STATUS
router.patch("/admin/requests/:id/status", async (req, res) => {
    const { status } = req.body

    const request = await Request.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    )

    if (!request) return res.status(404).json({ error: "Request not found" })

    res.json(request)
})

// DELETE
router.delete("/admin/requests/:id", async (req, res) => {
    await Request.findByIdAndDelete(req.params.id)
    res.json({ message: "Request deleted" })
})


// ─────────────────────────────────────────────
// ⭐ REVIEWS
// ─────────────────────────────────────────────

// GET ALL REVIEWS (KEEP)
router.get("/admin/reviews", async (req, res) => {
    const reviews = await Review.find()
        .populate("tradesman", "name")
        .populate("customer", "name")

    res.json(reviews)
})

// DELETE REVIEW
router.delete("/admin/reviews/:id", async (req, res) => {
    await Review.findByIdAndDelete(req.params.id)
    res.json({ message: "Review deleted" })
})


// ─────────────────────────────────────────────
// 🔥 GLOBAL OVERRIDE (POWER TOOL)
// ─────────────────────────────────────────────

router.delete("/admin/:model/:id", async (req, res) => {
    const { model, id } = req.params

    const models = {
        user: User,
        post: Post,
        service: Service,
        request: Request,
        review: Review
    }

    const Model = models[model]

    if (!Model) return res.status(400).json({ error: "Invalid model" })

    await Model.findByIdAndDelete(id)

    res.json({ message: `${model} deleted` })
})



module.exports = router