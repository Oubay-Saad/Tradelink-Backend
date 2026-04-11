const express = require("express")
const Service = require("../models/Service")
const { auth, isCustomer } = require("../middleware/auth")

const router = express.Router()

router.post("/services", auth, isCustomer, async(req,res) => {
    try{
       const {title, description, budget} = req.body
       const newService = new Service()
       
       newService.title = title
       newService.description = description
       newService.budget = budget
       newService.createdBy = req.user.id

       await newService.save()

       res.status(201).json({message: "Your'e service was created successfuly!", service: newService})
       
    }catch(err){
        res.status(500).json({error: "Server error"})
    }
})

router.get("/services", auth,async(req,res) => {
    try{
        const services = await Service.find().populate("createdBy" , "name")
        res.status(200).json({services: services})
    }catch(err){
        res.status(500).json({error: "Server error"})
    }
})

router.get("/services/:id", auth, async(req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate("createdBy", "name")
        
        if (!service) {
            return res.status(404).json({ error: "Service not found" })
        }

        res.status(200).json({ service })

    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
})

router.delete("/services/:id", auth, isCustomer, async(req, res) => {
    try {
        const service = await Service.findById(req.params.id)

        if (!service) {
            return res.status(404).json({ error: "Service not found" })
        }

        if (service.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ error: "You can only delete your own services" })
        }

        await Service.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: "Service deleted successfully!" })

    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
})


module.exports = router