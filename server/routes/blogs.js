const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const blogController = require('../controllers/blogController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.post('/', auth, upload.single('coverImage'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
], blogController.createBlog);

router.get('/', blogController.getAllBlogs);
router.get('/categories', blogController.getCategories);
router.get('/tags', blogController.getTags);
router.get('/my', auth, blogController.getMyBlogs);
router.get('/drafts', auth, blogController.getDrafts);
router.get('/bookmarked', auth, blogController.getBookmarkedBlogs);
router.get('/user/:userId', blogController.getUserBlogs);
router.get('/admin/stats', auth, admin, blogController.getAdminStats);
router.get('/:id', blogController.getBlogById);

router.put('/:id', auth, upload.single('coverImage'), blogController.updateBlog);
router.put('/:id/like', auth, blogController.toggleLike);
router.put('/:id/bookmark', auth, blogController.toggleBookmark);

router.delete('/:id', auth, blogController.deleteBlog);

module.exports = router;