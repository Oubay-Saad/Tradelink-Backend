require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const serviceRoutes = require("./routes/serviceRoutes")
const requestRoutes = require("./routes/requestRoutes")
const postRoutes = require("./routes/postRoutes")
const reviewRoutes = require("./routes/reviewRoutes")

const app = express()
const PORT = process.env.PORT

app.use(express.json())


mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Connected to data base")
}).catch((err) => {
    console.log("Failed to connect to data base: ", err)
})



app.use(authRoutes)
app.use(userRoutes)
app.use(serviceRoutes)
app.use(requestRoutes)
app.use(postRoutes)
app.use(reviewRoutes)


app.listen(PORT, () => console.log(`The server is runing on port ${PORT}`))