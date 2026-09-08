const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public endpoints for website frontend and dynamic menu navigation
router.get('/navigation', pageController.getNavigation);
router.get('/homepage', pageController.getHomepage);
router.get('/slug/:slug', pageController.getBySlug);

// Protected page management endpoints
router.post('/', authenticate, authorize('pages', 'create'), pageController.create);
router.post('/bulk-delete', authenticate, authorize('pages', 'delete'), pageController.bulkDelete);
router.get('/', authenticate, authorize('pages', 'read'), pageController.getAll);
router.put('/:id/approve', authenticate, authorize('pages', 'update'), pageController.approve);
router.get('/:id', authenticate, authorize('pages', 'read'), pageController.getById);
router.put('/:id', authenticate, authorize('pages', 'update'), pageController.update);
router.delete('/:id', authenticate, authorize('pages', 'delete'), pageController.delete);

// Public/Interactions page endpoints
router.post('/:id/comments', pageController.addComment);
router.post('/:id/comments/:commentId/replies', pageController.addReply);

module.exports = router;
