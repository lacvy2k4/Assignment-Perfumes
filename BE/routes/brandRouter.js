var express = require("express")
var brandRouter = express.Router()
const brandController = require("../controllers/brandController")

/**
 * @swagger
 * tags:
 *   name: Admin Brands
 *   description: Quản lý Brands (Admin/Member tuỳ phân quyền)
 */

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: Lấy danh sách tất cả Brands
 *     tags: [Admin Brands]
 *     responses:
 *       200:
 *         description: Trả về danh sách Brand
 *   post:
 *     summary: Tạo một Brand mới
 *     tags: [Admin Brands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brandName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Brand được tạo thành công
 */
brandRouter.route("/")
    .get(brandController.getBrands)
    .post(brandController.createBrand)

/**
 * @swagger
 * /api/brands/{id}:
 *   get:
 *     summary: Lấy thông tin một Brand qua ID
 *     tags: [Admin Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về thông tin Brand đó
 *   put:
 *     summary: Cập nhật thông tin Brand qua ID
 *     tags: [Admin Brands]
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
 *               brandName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Brand cập nhật thành công
 *   delete:
 *     summary: Xoá một Brand
 *     tags: [Admin Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xoá Brand thành công
 */
brandRouter.route("/:id")
    .get(brandController.getBrandById)
    .put(brandController.updateBrand)
    .delete(brandController.deleteBrand)
module.exports = brandRouter