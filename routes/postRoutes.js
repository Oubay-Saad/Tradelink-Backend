const express = require("express")
const sharp = require("sharp")
const Post = require("../models/Post")
const { auth, isTradesman } = require("../middleware/auth")
const upload = require("../config/upload")


const router = express.Router()

router.post("/posts", auth, isTradesman, async(req,res) => {
    try{
        const {title, description, images} = req.body

        const newPost = new Post()

        newPost.title = title
        newPost.description = description
        newPost.images = images
        newPost.postedBy = req.user.id
        
        await newPost.save()

        res.status(201).json({message: "Post created successfuly!", post: newPost})

    }catch(err){
        console.log(err)
        res.status(500).json({error: "Server error"})

    }
})

router.get("/posts/:id", auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("postedBy", "name profilePic")
        
        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }

        res.status(200).json({ post })

    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
})

router.delete("/posts/:id", auth, isTradesman, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }

        if (post.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ error: "You can only delete your own posts" })
        }

        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: "Post deleted successfully!" })

    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
})

router.patch("/:id/image", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No image provided" })

        const { userId } = req.body

        const compressedBuffer = await sharp(req.file.buffer)
            .resize(720, 720, {
                fit: "cover",
                position: "center"
            })
            .jpeg({ quality: 70 })
            .toBuffer()

        const base64 = `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`

        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $push: { images: base64 } },
            { returnDocument: "after" }
        )

        if (!post) return res.status(404).json({ error: "Post not found" })

        res.status(201).json(post)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router