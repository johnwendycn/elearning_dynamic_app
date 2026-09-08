const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

// Public authentication routes (Exempt from privilege and role access checks)
router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.get('/verify-reset-token/:token', authController.verifyResetToken);
router.post('/reset-password', authController.resetPassword);

// Protected user profile route
router.get('/me', authenticate, authController.getMe);
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;
