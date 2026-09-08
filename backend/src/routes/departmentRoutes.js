const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public
router.get('/active', departmentController.getActive);
router.get('/public/:id', departmentController.getById);

// Protected
router.post('/', authenticate, authorize('departments', 'create'), departmentController.create);
router.post('/bulk-delete', authenticate, authorize('departments', 'delete'), departmentController.bulkDelete);
router.get('/', authenticate, authorize('departments', 'read'), departmentController.getAll);
router.get('/:id', authenticate, authorize('departments', 'read'), departmentController.getById);
router.put('/:id', authenticate, authorize('departments', 'update'), departmentController.update);
router.delete('/:id', authenticate, authorize('departments', 'delete'), departmentController.delete);

module.exports = router;
