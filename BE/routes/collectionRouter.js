var express = require("express")
const collectionRouter = express.Router()
const jwt = require("jsonwebtoken")
const Member = require("../models/members")
const collectionController = require("../controllers/memberController")

const adminAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token
        if (!token) {
            return res.status(403).json({ status: false, message: "You do not have access." })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const member = await Member.findById(decoded.id)
        if (!member) {
            return res.status(403).json({ status: false, message: "You do not have access." })
        }

        if (!member.isAdmin) {
            return res.status(403).json({ status: false, message: "You do not have access." })
        }

        req.member = member
        next()
    } catch (error) {
        res.status(403).json({ status: false, message: "You do not have access." })
    }
}

/**
 * @swagger
 * tags:
 *   name: Collections
 *   description: Quản lý bộ sưu tập thành viên
 */

/**
 * @swagger
 * /api/collectors:
 *   get:
 *     summary: Lấy danh sách thành viên cho Collections
 *     tags: [Collections]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Trả về trang collections với danh sách members
 *       403:
 *         description: Trả về trang từ chối truy cập (Access Denied)
 */
collectionRouter.route("/")
    .get(adminAuth, collectionController.getMembers)

module.exports = collectionRouter