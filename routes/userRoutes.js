const express = require("express")
const User = require("../models/User")
const Post = require("../models/Post")
const Service = require("../models/Service")
const { auth } = require("../middleware/auth")


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

module.exports = router