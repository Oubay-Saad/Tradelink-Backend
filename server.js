require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const authRoutes = require("./routes/authRoutes")
const authGoogle = require("./test files/authGoogle")
const userRoutes = require("./routes/userRoutes")
const serviceRoutes = require("./routes/serviceRoutes")
const requestRoutes = require("./routes/requestRoutes")
const postRoutes = require("./routes/postRoutes")
const reviewRoutes = require("./routes/reviewRoutes")


const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Connected to data base")
}).catch((err) => {
    console.log("Failed to connect to data base: ", err)
})

// GET /api/job-types  — no auth needed, public
app.get("/job-types", (req, res) => {
    const JOB_TYPES = require("../config/jobTypes")
    res.status(200).json({ jobTypes: JOB_TYPES })
})


app.use(authRoutes)
app.use(userRoutes)
app.use(serviceRoutes)
app.use(requestRoutes)
app.use(postRoutes)
app.use(reviewRoutes)


app.listen(PORT, () => console.log(`The server is runing on port ${PORT}`))