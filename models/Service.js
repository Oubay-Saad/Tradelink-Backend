const mongoose = require("mongoose")
const Schema = mongoose.Schema


const serviceSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxlength: 100,
    },
    description: {
        type: String,
        required: true,
        maxlength: 800,
    },
    budget: {
        type: Number,
        required: true,
    },
    images: {
        type: [String],
        default: [],
        validate: {
            validator: (arr) => arr.length <= 3,
            message: "You can't upload more than 3 images"
        }
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })


const Service = mongoose.model("Service", serviceSchema)

module.exports = Service