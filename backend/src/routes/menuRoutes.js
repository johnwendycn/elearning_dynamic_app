const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// ── Public endpoint (no auth required) ──────────────────────────────────────
// Allows the public website header to fetch navigation menus from the database
// without needing a JWT token.
router.get('/public/location/:location', menuController.getByLocation);

// ── Protected management endpoints ──────────────────────────────────────────
router.use(authenticate);

router.post('/', authorize('menus', 'create'), menuController.create);
router.post('/bulk-delete', authorize('menus', 'delete'), menuController.bulkDelete);
router.get('/', authorize('menus', 'read'), menuController.getAll);
router.get('/location/:location', authorize('menus', 'read'), menuController.getByLocation);
router.get('/:id', authorize('menus', 'read'), menuController.getById);
router.put('/:id', authorize('menus', 'update'), menuController.update);
router.delete('/:id', authorize('menus', 'delete'), menuController.delete);

module.exports = router;
