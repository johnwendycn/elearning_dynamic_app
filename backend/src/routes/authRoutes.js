const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

// Public authentication routes (Exempt from privilege and role access checks)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected user profile route
router.get('/me', authenticate, authController.getMe);
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;
