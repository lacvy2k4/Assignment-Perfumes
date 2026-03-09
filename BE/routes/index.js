var express = require('express');
var router = express.Router();
const Perfume = require('../models/perfumes');
const Brand = require('../models/brands');
const Member = require('../models/members');
const jwt = require('jsonwebtoken');
const memberController = require('../controllers/memberController');

router.get('/', async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 16;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const filter = req.query.filter || '';

    let query = {};
    if (search) {
      query.perfumeName = { $regex: search, $options: 'i' };
    }
    if (filter) {
      const foundBrand = await Brand.findOne({ brandName: filter });
      if (foundBrand) {
        query.brand = foundBrand._id;
      } else {
        query.brand = null;
      }
    }

    const totalPerfumes = await Perfume.countDocuments(query);
    const totalPages = Math.ceil(totalPerfumes / limit) || 1;
    const perfumes = await Perfume.find(query).sort({ _id: -1 }).skip(skip).limit(limit).lean();

    const brands = await Brand.find().sort({ brandName: 1 }).lean();
    const brandMap = {};
    brands.forEach(b => { brandMap[b._id.toString()] = b.brandName; });
    perfumes.forEach(p => { p.brandName = brandMap[p.brand?.toString()] || ''; });

    const selectedBrandName = filter || '';

    let member = null;
    const token = req.cookies?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        member = await Member.findById(decoded.id).lean();
      } catch (e) { }
    }
    res.json({ status: true, data: { perfumes, brands, member, currentPage: page, totalPages, search, filter, selectedBrandName } });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth & Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                 token:
 *                   type: string
 *                   description: JWT token to use for Bearer Auth
 */
router.get('/login', memberController.login);
router.post('/login', memberController.handleLogin);

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Đăng xuất
 *     tags: [Auth & Members]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.get('/logout', memberController.logout);

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Đăng ký thành viên mới
 *     tags: [Auth & Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               YOB:
 *                 type: integer
 *               gender:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 */
router.get('/register', memberController.register);
router.post('/register', memberController.handleRegister);

const profileAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ status: false, message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const member = await Member.findById(decoded.id);
    if (!member) return res.status(401).json({ status: false, message: 'Unauthorized' });
    req.member = member;
    next();
  } catch (e) {
    res.status(401).json({ status: false, message: 'Unauthorized' });
  }
};

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Lấy thông tin tài khoản đang đăng nhập
 *     tags: [Auth & Members]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin profile
 *   patch:
 *     summary: Cập nhật Profile (Hồ sơ) 
 *     tags: [Auth & Members]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               YOB:
 *                 type: integer
 *               gender:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated
 *   put:
 *     summary: Thay đổi mật khẩu
 *     tags: [Auth & Members]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 */
router.get('/profile', async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ status: false, message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const member = await Member.findById(decoded.id).select("-password").lean();
    if (!member) return res.status(401).json({ status: false, message: 'Unauthorized' });
    res.status(200).json({ status: true, data: member });
  } catch (e) {
    res.status(401).json({ status: false, message: 'Unauthorized' });
  }
});

router.patch('/profile', profileAuth, memberController.editProfile);
router.put('/profile', profileAuth, memberController.changePassword);

module.exports = router;
