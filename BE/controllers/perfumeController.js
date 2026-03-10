const Perfume = require("../models/perfumes")
const Brand = require("../models/brands")
const Member = require("../models/members")
const jwt = require("jsonwebtoken")
require("../models/comments")

const getConcentrationClass = (concentration) => {
    if (!concentration) return "bg-base-100/50 border-base-content/20 text-base-content/60 font-medium";

    const text = concentration.toLowerCase();
    if (text.includes('extrait')) return "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37] font-bold shadow-[0_0_10px_rgba(212,175,55,0.3)]";
    if (text.includes('parfum') || text.includes('edp')) return "bg-[#B76E79]/10 border-[#B76E79] text-[#B76E79] font-semibold";
    if (text.includes('toilette') || text.includes('edt')) return "bg-[#64748B]/10 border-[#64748B] text-[#64748B] font-semibold";
    if (text.includes('cologne') || text.includes('fraiche')) return "bg-[#5F9EA0]/10 border-[#5F9EA0] text-[#5F9EA0] font-semibold";

    return "bg-base-100/50 border-base-content/20 text-base-content/60 font-medium";
};

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
async function getAuthDataForPerfume(req, perfume) {
    let member = null;
    let hasCommented = false;
    const token = req.cookies?.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            member = await Member.findById(decoded.id).lean();
            if (member && perfume.comments) {
                hasCommented = perfume.comments.some(c => c.author?._id?.toString() === member._id.toString());
            }
        } catch (e) { }
    }
    return { member, hasCommented };
}

exports.getPerfumes = async (req, res) => {
    try {
        const admin = await getAdminMember(req)
        if (!admin) {
            return res.status(403).json({ status: false, message: "You do not have access." })
        }
        const { search, filter } = req.query;
        if (search) {
            const perfumes = await Perfume.find({ perfumeName: { $regex: search, $options: 'i' } }).populate("brand", "brandName").lean();
            const brands = await Brand.find().lean();
            return res.json({ status: true, perfumes, brands });
        }
        if (filter) {
            const perfumes = await Perfume.find({ brand: filter }).populate("brand", "brandName").lean();
            const brands = await Brand.find().lean();
            return res.json({ status: true, perfumes, brands });
        }
        const perfumes = await Perfume.find().populate("brand", "brandName").lean();
        const brands = await Brand.find().lean();
        res.json({ status: true, perfumes, brands });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

exports.createPerfume = async (req, res) => {
    try {
        const admin = await getAdminMember(req)
        if (!admin) {
            return res.status(403).json({ status: false, message: "You do not have access." })
        }
        const { perfumeName, uri, price, concentration, description, ingredients, volume, targetAudience, brand } = req.body
        if (!perfumeName || !uri || !price || !concentration || !description || !ingredients || !volume || !targetAudience || !brand) {
            return res.status(400).json({ status: false, message: "Missing required fields" })
        }
        if (price <= 0 || volume <= 0) {
            return res.status(400).json({ status: false, message: "Value must be greater than 0" })
        }
        const existPerfume = await Perfume.findOne({ perfumeName: req.body.perfumeName })
        if (existPerfume) {
            return res.status(400).json({ status: false, message: "Perfume name already exists" })
        }
        const perfume = await Perfume.create({
            perfumeName, uri, price, concentration, description, ingredients, volume, targetAudience, brand
        })

        res.status(201).json({ status: true, message: "Perfume created successfully", perfume })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

exports.getPerfumeById = async (req, res) => {
    try {
        const perfume = await Perfume.findById(req.params.id)
            .populate("brand", "brandName")
            .populate({ path: "comments", populate: { path: "author", select: "name" } })
            .lean();
        if (!perfume) return res.status(404).json({ status: false, message: "Perfume not found" });

        const { member, hasCommented } = await getAuthDataForPerfume(req, perfume);

        res.json({ status: true, data: perfume, member, hasCommented });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ status: false, message: "Perfume not found" });
        }
        res.status(500).json({ status: false, message: error.message })
    }
}

exports.getPerfumeByName = async (req, res) => {
    try {
        const perfume = await Perfume.findOne({ perfumeName: req.params.perfumeName })
            .populate("brand", "brandName")
            .populate({ path: "comments", populate: { path: "author", select: "name" } })
            .lean();
        if (!perfume) return res.status(404).json({ status: false, message: "Perfume not found" });

        const { member, hasCommented } = await getAuthDataForPerfume(req, perfume);

        res.json({ status: true, data: perfume, member, hasCommented });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

exports.updatePerfume = async (req, res) => {
    try {
        const admin = await getAdminMember(req)
        if (!admin) {
            return res.status(403).json({ status: false, message: "You do not have access." })
        }
        const { perfumeName, uri, price, concentration, description, ingredients, volume, targetAudience, brand } = req.body
        if (!perfumeName || !uri || !price || !concentration || !description || !ingredients || !volume || !targetAudience || !brand) {
            return res.status(400).json({ status: false, message: "Missing required fields" })
        }
        if (price <= 0 || volume <= 0) {
            return res.status(400).json({ status: false, message: "Value must be greater than 0" })
        }
        const existPerfume = await Perfume.findOne({ perfumeName: req.body.perfumeName })
        if (existPerfume) {
            return res.status(400).json({ status: false, message: "Perfume name already exists" })
        }
        const perfume = await Perfume.findByIdAndUpdate(req.params.id, {
            perfumeName, uri, price, concentration, description, ingredients, volume, targetAudience, brand
        }, { new: true })

        res.status(200).json({ status: true, message: "Perfume updated successfully", perfume })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

exports.deletePerfume = async (req, res) => {
    try {
        const admin = await getAdminMember(req)
        if (!admin) {
            return res.status(403).json({ status: false, message: "You do not have access." })
        }
        const perfume = await Perfume.findByIdAndDelete(req.params.id)
        res.status(200).json({ status: true, message: "Perfume deleted successfully", perfume })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

