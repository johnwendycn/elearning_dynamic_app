const express = require('express');
const router = express.Router();
const unitFileController = require('../controllers/unitFileController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Protected
router.post('/', authenticate, authorize('units', 'create'), unitFileController.create);
router.post('/bulk-delete', authenticate, authorize('units', 'delete'), unitFileController.bulkDelete);
router.get('/', authenticate, authorize('units', 'read'), unitFileController.getAll);
router.get('/:id', authenticate, authorize('units', 'read'), unitFileController.getById);
router.put('/:id', authenticate, authorize('units', 'update'), unitFileController.update);
router.delete('/:id', authenticate, authorize('units', 'delete'), unitFileController.delete);

module.exports = router;
