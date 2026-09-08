const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carouselController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// ── Public endpoints (no auth required) ─────────────────────────────────────
// Fetches the currently active carousel(s) for the public website
router.get('/active', carouselController.getActive);
// Fetches a specific carousel by ID for the public website (e.g. homepage sections)
router.get('/public/:id', carouselController.getById);

// ── Protected management endpoints ──────────────────────────────────────────
router.post('/', authenticate, authorize('carousels', 'create'), carouselController.create);
router.post('/bulk-delete', authenticate, authorize('carousels', 'delete'), carouselController.bulkDelete);
router.get('/', authenticate, authorize('carousels', 'read'), carouselController.getAll);
router.get('/:id', authenticate, authorize('carousels', 'read'), carouselController.getById);
router.put('/:id', authenticate, authorize('carousels', 'update'), carouselController.update);
router.delete('/:id', authenticate, authorize('carousels', 'delete'), carouselController.delete);

module.exports = router;

