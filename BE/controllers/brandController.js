const Brand = require("../models/brands")
const Member = require("../models/members")
const jwt = require("jsonwebtoken")

async function getAdminMember(req) {
    try {
        const token = req.cookies?.token
        if (!token) return null
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const member = await Member.findById(decoded.id)
        if (!member || !member.isAdmin) return null
        return member
    } catch (e) {
        return null
    }
}

exports.getBrands = async (req, res) => {
    try {
        const admin = await getAdminMember(req)
        if (!admin) {
            return res.status(403).json({ status: false, message: "You do not have access." })
        }
        const brands = await Brand.find().lean()
        res.json({ status: true, brands })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

exports.createBrand = async (req, res) => {
    try {
        const admin = await getAdminMember(req)
        if (!admin) {
            return res.status(403).json({ status: false, message: "You do not have access." })
        }
        const existBrand = await Brand.findOne({ brandName: req.body.brandName })
        if (existBrand) {
            return res.status(400).json({ status: false, message: "Brand name already exists" })
        }
        const brand = await Brand.create(req.body)
        if (!brand) {
            return res.status(400).json({ status: false, message: "Brand not created" })
        }
        res.status(201).json({ status: true, message: "Brand created successfully", brand })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

exports.getBrandById = async (req, res) => {
    try {
        const admin = await getAdminMember(req)
        if (!admin) {
            return res.status(403).json({ status: false, message: "You do not have access." })
        }
        const brand = await Brand.findById(req.params.id).lean()
        res.json({ status: true, brand })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

exports.updateBrand = async (req, res) => {
    try {
        const admin = await getAdminMember(req)
        if (!admin) {
            return res.status(403).json({ status: false, message: "You do not have access." })
        }
        const existBrand = await Brand.findOne({ brandName: req.body.brandName })
        if (existBrand) {
            return res.status(400).json({ status: false, message: "Brand name already exists" })
        }
        const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.status(200).json({ status: true, message: "Brand updated successfully", brand })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

exports.deleteBrand = async (req, res) => {
    try {
        const admin = await getAdminMember(req)
        if (!admin) {
            return res.status(403).json({ status: false, message: "You do not have access." })
        }
        const brand = await Brand.findByIdAndDelete(req.params.id)
        res.status(200).json({ status: true, message: "Brand deleted successfully", brand })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}