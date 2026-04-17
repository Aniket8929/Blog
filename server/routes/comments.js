const express = require('express');
const { body } = require('express-validator');
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, [
  body('blogId').notEmpty().withMessage('Blog ID is required'),
  body('text').trim().notEmpty().withMessage('Comment text is required')
], commentController.createComment);

router.get('/:blogId', commentController.getBlogComments);

router.delete('/:id', auth, commentController.deleteComment);

module.exports = router;