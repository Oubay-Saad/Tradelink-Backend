const express = require("express")
const Service = require("../models/Service")
const Request = require("../models/Request")
const { auth, isCustomer, isTradesman } = require("../middleware/auth")

const router = express.Router()


router.post("/services/:serviceId/requests", auth, isTradesman, async(req,res) => {
    try{
        const service = await Service.findById(req.params.serviceId)
        if(!service){
            return res.status(404).json({error: "Service not found"})
        }

        const {estimatedPrice, message} = req.body

        const newRequest = new Request()

        newRequest.service = req.params.serviceId
        newRequest.estimatedPrice = estimatedPrice
        newRequest.message = message
        newRequest.requestedBy = req.user.id

        await newRequest.save()

        res.status(201).json({message: "Request sent successfuly!", request: newRequest})
    }catch(err){
        if (err.name === "ValidationError") {
            return res.status(400).json({ error: err.message })
        }

        res.status(500).json({error: "Server error"})
    }
})

router.get("/services/:serviceId/requests", auth, async(req, res) => {
    try{
        const requests = await Request.find({service : req.params.serviceId})
        res.status(200).json({requests: requests})
    }catch(err){
        res.status(500).json({error: "Server error"})
    }
})  

router.patch("/requests/:requestId/status", auth, isCustomer, async(req, res) => {
    try {
        const { status } = req.body

        const request = await Request.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )

        if (!request) {
            return res.status(404).json({ error: "Request not found" })
        }

        res.status(200).json({ message: "Request status updated!", request })

    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
})


module.exports = router