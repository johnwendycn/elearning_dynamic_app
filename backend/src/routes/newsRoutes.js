const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public
router.get('/published', newsController.getPublished);
router.get('/slug/:slug', newsController.getBySlug);
router.get('/public/:id', newsController.getById);

// Protected
router.post('/', authenticate, authorize('news', 'create'), newsController.create);
router.post('/bulk-delete', authenticate, authorize('news', 'delete'), newsController.bulkDelete);
router.get('/', authenticate, authorize('news', 'read'), newsController.getAll);
router.get('/:id', authenticate, authorize('news', 'read'), newsController.getById);
router.put('/:id', authenticate, authorize('news', 'update'), newsController.update);
router.delete('/:id', authenticate, authorize('news', 'delete'), newsController.delete);

module.exports = router;
