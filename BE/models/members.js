const mongoose = require("mongoose")

const memberSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    YOB: {
        type: Number,
        require: true
    },
    gender: {
        type: Boolean,
        require: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Member = mongoose.model("Member", memberSchema)
module.exports = Member