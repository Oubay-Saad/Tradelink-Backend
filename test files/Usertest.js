const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, unique: true, sparse: true },  // sparse = allows multiple nulls
  phone:    { type: String, unique: true, sparse: true },
  password: { type: String },                              // optional for OAuth users
  role:     { type: String, enum: ["customer", "tradesman"], required: true },
  googleId: { type: String, unique: true, sparse: true }, // Google user ID
  avatar:   { type: String },                              // profile picture URL
}, { timestamps: true })

module.exports = mongoose.model("Usertest", UserSchema)