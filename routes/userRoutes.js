const express = require("express")
const sharp = require("sharp")
const User = require("../models/User")
const Post = require("../models/Post")
const Service = require("../models/Service")
const { auth } = require("../middleware/auth")
const upload = require("../config/upload")


const router = express.Router()


router.get("/users/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password")

        if(!user){
            return res.status(404).json({ error: "User not found" })
        }

        const response = { user }

        if(user.role === "tradesman"){
            response.posts = await Post.find({ postedBy: req.params.id })
        }

        if(user.role === "customer"){
            response.services = await Service.find({createdBy: req.params.id})
        }

        res.status(200).json(response)

    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
})


router.patch("/users/me", auth, upload.single("profilePic"), async (req, res) => {
    try {
        const { bio, location, skills, experience } = req.body
        const updatedData = { bio, location }

        // Handle profile pic if provided
        if (req.file) {
            const compressedBuffer = await sharp(req.file.buffer)
                .resize(300, 300)
                .jpeg({ quality: 60 })
                .toBuffer()
            updatedData.profilePic = `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`
        }

        // Handle tradesman-specific fields
        if (req.user.role === "tradesman") {
            updatedData.tradesmanInfo = { skills, experience }
        }

        const updated = await User.findByIdAndUpdate(
            req.user.id,
            updatedData,
            { returnDocument: "after" }
        ).select("-password")

        res.status(200).json({ message: "Updated successfully!", user: updated })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})




module.exports = router