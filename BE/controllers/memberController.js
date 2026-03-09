const Member = require("../models/members")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET

exports.login = async (req, res) => {
    res.json({ status: true, message: "Login successful" });
}

exports.handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ status: false, message: "Please enter email and password" })
        }

        const memberWithPassword = await Member.findOne({ email })
        if (!memberWithPassword) {
            return res.status(401).json({ status: false, message: "Email does not exist" })
        }

        const isMatch = await bcrypt.compare(password, memberWithPassword.password)
        if (!isMatch) {
            return res.status(401).json({ status: false, message: "Password is incorrect" })
        }

        const token = jwt.sign({ id: memberWithPassword._id }, JWT_SECRET, { expiresIn: "1d" })

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        })

        const member = await Member.findById(memberWithPassword._id).select("-password").lean()
        res.status(200).json({ status: true, message: "Login successful", data: member, token })
    } catch (error) {
        res.status(500).json({ status: false, message: "An error occurred, please try again." })
    }
}

exports.logout = (req, res) => {
    res.clearCookie("token")
    res.json({ status: true, message: "Logged out successfully" })
}

exports.register = async (req, res) => {
    res.json({ status: true, message: "Register successful" });
}

exports.handleRegister = async (req, res) => {
    try {
        const { name, email, password, YOB, gender } = req.body
        if (!name || !email || !password || !YOB || gender === undefined) {
            return res.status(400).json({ status: false, message: "Please fill in all the information." })
        }

        if (name.length < 1) {
            return res.status(400).json({ status: false, message: "The name is too short." })
        }

        if (name.length > 50) {
            return res.status(400).json({ status: false, message: "The name is too long." })
        }

        if (password.length < 8) {
            return res.status(400).json({ status: false, message: "Password must be at least 8 characters" })
        }

        const currentYear = new Date().getFullYear()
        const age = currentYear - parseInt(YOB)
        if (age < 0 || age > 100) {
            return res.status(400).json({ status: false, message: "Invalid year of birth" })
        }

        const existingMember = await Member.findOne({ email })
        if (existingMember) {
            return res.status(400).json({ status: false, message: "The email already exists." })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        let member = await Member.create({
            name,
            email,
            password: hashedPassword,
            YOB: parseInt(YOB),
            gender: gender === true || gender === "true"
        })

        const token = jwt.sign({ id: member._id }, JWT_SECRET, { expiresIn: "1d" })
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        })

        member = await Member.findById(member._id).select("-password").lean()
        res.status(201).json({ status: true, message: "Registration successful", data: member })
    } catch (error) {
        res.status(500).json({ status: false, message: "An error occurred, please try again." })
    }
}

exports.getProfile = async (req, res) => {
    try {
        const member = await Member.findById(req.member._id)
        res.json({ status: true, member })
    } catch (error) {
        res.status(500).json({ status: false, message: "An error occurred, please try again." })
    }
}

exports.editProfile = async (req, res) => {
    try {
        const { name, YOB, gender } = req.body
        if (!name || !YOB || gender === undefined) {
            return res.status(400).json({ status: false, message: "Invalid input" })
        }

        if (name.length < 1) {
            return res.status(400).json({ status: false, message: "The name is too short." })
        }

        if (name.length > 50) {
            return res.status(400).json({ status: false, message: "The name is too long." })
        }

        const currentYear = new Date().getFullYear()
        const age = currentYear - parseInt(YOB)
        if (age < 0 || age > 100) {
            return res.status(400).json({ status: false, message: "Invalid year of birth." })
        }
        const member = await Member.findById(req.member._id)
        if (!member) return res.status(404).json({ status: false, message: "Member not found" })
        member.name = name
        member.YOB = parseInt(YOB)
        member.gender = gender === "true"
        await member.save()
        res.json({ status: true, message: "Profile updated successfully", data: member })
    } catch (error) {
        res.status(500).json({ status: false, message: "An error occurred, please try again." })
    }
}

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ status: false, message: "Please fill in all fields" })
        }

        const member = await Member.findById(req.member._id)
        if (!member) return res.status(404).json({ status: false, message: "Member not found" })
        const isMatch = await bcrypt.compare(currentPassword, member.password)
        if (!isMatch) {
            return res.status(400).json({ status: false, message: "Current password is incorrect" })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        member.password = hashedPassword
        await member.save()

        res.json({ status: true, message: "Password changed successfully" })
    } catch (error) {
        res.status(500).json({ status: false, message: "An error occurred, please try again." })
    }
}

exports.getMembers = async (req, res) => {
    try {
        const members = await Member.find().select("-password").lean()
        res.json({ status: true, members })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}