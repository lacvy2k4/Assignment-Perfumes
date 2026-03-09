var express = require("express")
const perfumeRouter = express.Router()
const perfumeController = require("../controllers/perfumeController")

/**
 * @swagger
 * tags:
 *   name: Admin Perfumes
 *   description: Quản lý Nước hoa (Admin/Member tuỳ phân quyền)
 */

/**
 * @swagger
 * /api/perfumes:
 *   get:
 *     summary: Lấy danh sách tất cả Perfumes
 *     tags: [Admin Perfumes]
 *     responses:
 *       200:
 *         description: Trả về danh sách Perfumes
 *   post:
 *     summary: Tạo một Perfume mới
 *     tags: [Admin Perfumes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               perfumeName:
 *                 type: string
 *               uri:
 *                 type: string
 *               price:
 *                 type: number
 *               concentration:
 *                 type: string
 *               description:
 *                 type: string
 *               ingredients:
 *                 type: string
 *               volume:
 *                 type: number
 *               targetAudience:
 *                 type: string
 *               brand:
 *                 type: string
 *                 description: ID của Brand liên quan
 *     responses:
 *       201:
 *         description: Trả về thông tin Perfume được tạo
 */
perfumeRouter.route("/")
    .get(perfumeController.getPerfumes)
    .post(perfumeController.createPerfume)

/**
 * @swagger
 * /api/perfumes/{id}:
 *   get:
 *     summary: Lấy thông tin một Perfume qua ID
 *     tags: [Admin Perfumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về thông tin chi tiết Perfume
 *   put:
 *     summary: Cập nhật thông tin Perfume qua ID
 *     tags: [Admin Perfumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               perfumeName:
 *                 type: string
 *               uri:
 *                 type: string
 *               price:
 *                 type: number
 *               concentration:
 *                 type: string
 *               description:
 *                 type: string
 *               ingredients:
 *                 type: string
 *               volume:
 *                 type: number
 *               targetAudience:
 *                 type: string
 *               brand:
 *                 type: string
 *     responses:
 *       200:
 *         description: Update Perfume thành công
 *   delete:
 *     summary: Xoá một Perfume
 *     tags: [Admin Perfumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete Perfume thành công
 */
perfumeRouter.route("/:id")
    .get(perfumeController.getPerfumeById)
    .put(perfumeController.updatePerfume)
    .delete(perfumeController.deletePerfume)
/**
 * @swagger
 * /api/perfumes/name/{perfumeName}:
 *   get:
 *     summary: Lấy thông tin một Perfume qua tên
 *     tags: [Admin Perfumes]
 *     parameters:
 *       - in: path
 *         name: perfumeName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về thông tin chi tiết Perfume
 */
perfumeRouter.route("/name/:perfumeName")
    .get(perfumeController.getPerfumeByName)

module.exports = perfumeRouter