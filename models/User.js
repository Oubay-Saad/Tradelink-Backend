const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 10,
        maxLength: 10
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true        
    },

    role: {
        type: String,
        enum: ["customer", "tradesman"],
        default: "customer",
        required: true
    },

    password: {
        type: String,
        required: true,
    },

    // other informations

    profilePic: {
        type: String,
        default: null
    },

    bio: {
        type: String,
        maxlenght: 500,
        default: null
    },

    location: {
        type: String,
        default: null
    },

    tradesmanInfo: {
        skills: {
            type: [String], 
            default: []
        },
        experience: {
            type: Number, 
            default: null
        },
        gallery: {
            type: [Schema.Types.ObjectId],
            ref: "Post",
            default: []
        }
    }
},{ timestamps: true })

const User = mongoose.model("User", userSchema)

module.exports = User