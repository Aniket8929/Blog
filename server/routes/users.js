const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.get('/', auth, admin, userController.getAllUsers);

router.get('/:id', auth, userController.getUserById);

router.put('/:id', auth, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('bio').optional().isLength({ max: 200 }).withMessage('Bio cannot exceed 200 characters')
], userController.updateUser);

router.put('/:id/block', auth, admin, userController.blockUser);

router.put('/:id/role', auth, admin, userController.changeRole);

router.get('/:id/stats', auth, userController.getUserStats);

module.exports = router;