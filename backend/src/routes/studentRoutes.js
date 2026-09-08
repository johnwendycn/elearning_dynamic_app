const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate } = require('../middlewares/authMiddleware');

// Public verification endpoint
router.get('/certificates/verify/:identifier', studentController.verifyCertificate);
router.get('/certificates/email-preview/:identifier?', studentController.previewCertificateEmail);

// Protected student learning endpoints
router.post('/enroll/:courseId', authenticate, studentController.enroll);
router.get('/my-learning', authenticate, studentController.getMyLearning);
router.get('/courses/:courseIdOrSlug/learn', authenticate, studentController.getCoursePlayer);
router.post('/units/:unitId/complete', authenticate, studentController.completeUnit);
router.get('/certificates/my-certificates', authenticate, studentController.getMyCertificates);
router.post('/certificates/:certificateId/resend-email', authenticate, studentController.resendCertificateEmail);

module.exports = router;
