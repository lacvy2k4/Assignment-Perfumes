const express = require('express');
const router = express.Router();
const Perfume = require('../models/perfumes');
const Brand = require('../models/brands');

/**
 * @swagger
 * tags:
 *   name: API
 *   description: API để cung cấp JSON cho Frontend
 */

/**
 * @swagger
 * /api/perfumes:
 *   get:
 *     summary: Lấy danh sách Perfumes
 *     tags: [API]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên nước hoa
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Lọc theo tên Brand
 *     responses:
 *       200:
 *         description: Danh sách Perfumes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/perfumes', async (req, res) => {
    try {
        const { search, brand } = req.query;
        let query = {};
        if (search) {
            query.perfumeName = { $regex: search, $options: 'i' };
        }
        if (brand) {
            const foundBrand = await Brand.findOne({ brandName: brand });
            if (foundBrand) {
                query.brand = foundBrand._id;
            } else {
                // If brand not found, return empty array by querying for an impossible condition
                query.brand = null;
            }
        }

        const perfumes = await Perfume.find(query)
            .populate("brand", "brandName")
            .sort({ _id: -1 })
            .lean();

        // Map the populated brandName into the object root to support frontend logic easily
        const formattedPerfumes = perfumes.map(p => ({
            ...p,
            brandName: p.brand?.brandName || 'Unknown'
        }));

        res.json({ status: true, data: formattedPerfumes });
    } catch (e) {
        res.status(500).json({ status: false, message: e.message });
    }
});

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: Lấy danh sách Brands
 *     tags: [API]
 *     responses:
 *       200:
 *         description: Danh sách Brands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/brands', async (req, res) => {
    try {
        const brands = await Brand.find().sort({ brandName: 1 }).lean();
        res.json({ status: true, data: brands });
    } catch (e) {
        res.status(500).json({ status: false, message: e.message });
    }
});

module.exports = router;
