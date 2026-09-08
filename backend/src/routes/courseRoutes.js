const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public endpoints
router.get('/active', courseController.getActive);
router.get('/slug/:slug', courseController.getBySlug);
router.get('/public/:id', courseController.getById);
router.get('/public', courseController.getAll);
router.get('/:id/reviews', courseController.getReviews);
router.post('/:id/reviews', courseController.addReview);

// Protected admin endpoints
router.post('/', authenticate, authorize('courses', 'create'), courseController.create);
router.post('/bulk-delete', authenticate, authorize('courses', 'delete'), courseController.bulkDelete);
router.get('/', authenticate, authorize('courses', 'read'), courseController.getAll);
router.get('/:id', authenticate, authorize('courses', 'read'), courseController.getById);
router.put('/:id', authenticate, authorize('courses', 'update'), courseController.update);
router.delete('/:id', authenticate, authorize('courses', 'delete'), courseController.delete);

module.exports = router;
