const mongoose = require("mongoose")

const perfumeSchema = new mongoose.Schema({
    perfumeName: {
        type: String,
        unique: true,
        required: true,
    },
    uri: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    concentration: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    ingredients: {
        type: String,
        require: true
    },
    volume: {
        type: Number,
        require: true
    },
    targetAudience: {
        type: String,
        require: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        require: true
    },
}, { timestamps: true })

const Perfume = mongoose.model("Perfume", perfumeSchema)
module.exports = Perfume