const express = require('express');
const router = express.Router();
const courseModuleController = require('../controllers/courseModuleController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public
router.get('/public/:id', courseModuleController.getById);

// Protected
router.post('/', authenticate, authorize('course_modules', 'create'), courseModuleController.create);
router.post('/bulk-delete', authenticate, authorize('course_modules', 'delete'), courseModuleController.bulkDelete);
router.get('/', authenticate, authorize('course_modules', 'read'), courseModuleController.getAll);
router.get('/:id', authenticate, authorize('course_modules', 'read'), courseModuleController.getById);
router.put('/:id', authenticate, authorize('course_modules', 'update'), courseModuleController.update);
router.delete('/:id', authenticate, authorize('course_modules', 'delete'), courseModuleController.delete);

module.exports = router;
