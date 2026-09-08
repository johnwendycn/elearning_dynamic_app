



const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public endpoints
router.get('/upcoming', eventController.getUpcoming);
router.get('/slug/:slug', eventController.getBySlug);
router.get('/public/:id', eventController.getById);
router.get('/public', eventController.getAll);

// Protected admin endpoints
router.post('/', authenticate, authorize('events', 'create'), eventController.create);
router.post('/bulk-delete', authenticate, authorize('events', 'delete'), eventController.bulkDelete);
router.get('/', authenticate, authorize('events', 'read'), eventController.getAll);
router.get('/:id', authenticate, authorize('events', 'read'), eventController.getById);
router.put('/:id', authenticate, authorize('events', 'update'), eventController.update);
router.delete('/:id', authenticate, authorize('events', 'delete'), eventController.delete);

module.exports = router;
