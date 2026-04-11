const express = require("express")
const Post = require("../models/Post")
const { auth, isTradesman } = require("../middleware/auth")

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

module.exports = router