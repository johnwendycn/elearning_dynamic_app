const express = require('express');
const router = express.Router();
const headerController = require('../controllers/headerController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public active header endpoint for frontend rendering
router.get('/active', headerController.getActive);

// Protected management endpoints
router.post('/', authenticate, authorize('headers', 'create'), headerController.create);
router.post('/bulk-delete', authenticate, authorize('headers', 'delete'), headerController.bulkDelete);
router.get('/', authenticate, authorize('headers', 'read'), headerController.getAll);
router.get('/:id', authenticate, authorize('headers', 'read'), headerController.getById);
router.put('/:id', authenticate, authorize('headers', 'update'), headerController.update);
router.delete('/:id', authenticate, authorize('headers', 'delete'), headerController.delete);

module.exports = router;
