var express = require("express")
const commentRouter = express.Router()
const commentController = require("../controllers/commentController")
const authMiddleware = require("../middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Đánh giá và bình luận về Nước hoa
 */

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Lấy danh sách tất cả các comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: Trả về danh sách bình luận
 */
commentRouter.route("/")
    .get(commentController.getComments)

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Cập nhật đánh giá
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của Comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đã cập nhật bình luận
 *   delete:
 *     summary: Xoá đánh giá
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của Comment
 *     responses:
 *       200:
 *         description: Đã xoá bình luận
 */
commentRouter.route("/:id")
    .put(authMiddleware, commentController.updateComment)
    .delete(authMiddleware, commentController.deleteComment)

/**
 * @swagger
 * /api/comments/perfumes/{id}:
 *   post:
 *     summary: Thêm comment cho một Perfume cụ thể
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của Perfume
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đã thêm bình luận
 */
commentRouter.route("/perfumes/:id")
    .post(authMiddleware, commentController.createComment)

module.exports = commentRouter