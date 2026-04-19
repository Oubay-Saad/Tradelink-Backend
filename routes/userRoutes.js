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

router.get("/users/:id/posts", auth, async(req,res) => {
    try{
        const posts = await Post.find({postedBy: req.params.id})
        res.status(200).json({Gallery: posts})

    }catch(err){
        res.status(500).json({error: "Server error"})
    }
})

router.patch("/users/me", auth, async(req,res) => {
    try{
        const {bio, location, skills, experience} = req.body
        const updatedData = {bio, location}

        if(req.user.role === "tradesman"){
            updatedData.tradesmanInfo = {skills, experience}
        }
        
        const updated = await User.findByIdAndUpdate(req.user.id, updatedData, {new: true}).select("-password")
        
        res.status(200).json({message: "updated successfuly!", user: updated})

    }catch(err){
        res.status(500).json({error: "Server error"})
    }
})

router.patch("/:id/profile-pic", upload.single("profilePic"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No image provided" })

        // Compress + resize image
        const compressedBuffer = await sharp(req.file.buffer)
            .resize(300, 300) // resize (good for profile pics)
            .jpeg({ quality: 60 }) // compress (0–100)
            .toBuffer();

        console.log("Original size:", req.file.buffer.length / 1024, "KB")
        console.log("Compressed size:", compressedBuffer.length / 1024, "KB")

        // Convert buffer to Base64 string with its mime type prefix
        // This prefix tells the frontend how to render it directly
        const base64 = `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`

        console.log("Base64 length:", base64.length, "characters")

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { profilePic: base64 },
            { new: true }
        )

        if (!user) return res.status(404).json({ error: "User not found" })

        res.json({ profilePic: user.profilePic })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})


module.exports = router