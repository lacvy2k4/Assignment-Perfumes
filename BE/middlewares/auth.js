const jwt = require("jsonwebtoken")
const Member = require("../models/members")
const JWT_SECRET = process.env.JWT_SECRET

const authMiddleware = async (req, res, next) => {
    try {
        let token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ status: false, message: 'Unauthorized' })
        }
        const decoded = jwt.verify(token, JWT_SECRET)
        const member = await Member.findById(decoded.id)
        if (!member) {
            return res.status(401).json({ status: false, message: "Unauthorized" })
        }
        req.member = member
        next()
    } catch (error) {
        res.status(401).json({ status: false, message: 'Unauthorized' })
    }
}

module.exports = authMiddleware