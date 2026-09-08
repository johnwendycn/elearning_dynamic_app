const express = require('express');
const router = express.Router();
const roleModuleController = require('../controllers/roleModuleController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/', authorize('roles', 'update'), roleModuleController.assign);
router.post('/bulk-delete', authorize('roles', 'delete'), roleModuleController.bulkDelete);
router.get('/', authorize('roles', 'read'), roleModuleController.getAll);
router.get('/:id', authorize('roles', 'read'), roleModuleController.getById);
router.put('/:id', authorize('roles', 'update'), roleModuleController.update);
router.delete('/:id', authorize('roles', 'delete'), roleModuleController.delete);

module.exports = router;
