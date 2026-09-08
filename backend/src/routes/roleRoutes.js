const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/', authorize('roles', 'create'), roleController.create);
router.post('/bulk-delete', authorize('roles', 'delete'), roleController.bulkDelete);
router.post('/:id/modules', authorize('roles', 'update'), roleController.assignModules);
router.get('/', authorize('roles', 'read'), roleController.getAll);
router.get('/:id', authorize('roles', 'read'), roleController.getById);
router.put('/:id', authorize('roles', 'update'), roleController.update);
router.delete('/:id', authorize('roles', 'delete'), roleController.delete);

module.exports = router;
