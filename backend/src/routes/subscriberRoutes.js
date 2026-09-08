const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// ─── Public Routes (no auth required) ────────────────────────────────────────
router.post('/subscribe', subscriberController.subscribe);
router.post('/unsubscribe', subscriberController.unsubscribe);
router.get('/unsubscribe', subscriberController.unsubscribe);

// ─── Admin Protected Routes ───────────────────────────────────────────────────
router.post('/broadcast', authenticate, authorize('subscribers', 'create'), subscriberController.broadcast);
router.get('/stats', authenticate, authorize('subscribers', 'read'), subscriberController.getStats);
router.get('/', authenticate, authorize('subscribers', 'read'), subscriberController.getAll);
router.get('/:id', authenticate, authorize('subscribers', 'read'), subscriberController.getById);
router.put('/:id', authenticate, authorize('subscribers', 'update'), subscriberController.update);
router.post('/bulk-delete', authenticate, authorize('subscribers', 'delete'), subscriberController.bulkDelete);
router.delete('/:id', authenticate, authorize('subscribers', 'delete'), subscriberController.delete);

module.exports = router;
