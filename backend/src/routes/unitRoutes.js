const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public
router.get('/public/:id', unitController.getById);

// Protected
router.post('/', authenticate, authorize('units', 'create'), unitController.create);
router.post('/bulk-delete', authenticate, authorize('units', 'delete'), unitController.bulkDelete);
router.get('/', authenticate, authorize('units', 'read'), unitController.getAll);
router.get('/:id', authenticate, authorize('units', 'read'), unitController.getById);
router.put('/:id', authenticate, authorize('units', 'update'), unitController.update);
router.delete('/:id', authenticate, authorize('units', 'delete'), unitController.delete);

module.exports = router;
