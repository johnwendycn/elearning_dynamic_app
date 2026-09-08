const express = require('express');
const router = express.Router();
const userRoleController = require('../controllers/userRoleController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/', authorize('roles', 'update'), userRoleController.assign);
router.post('/remove', authorize('roles', 'update'), userRoleController.remove);
router.post('/bulk-delete', authorize('roles', 'delete'), userRoleController.bulkDelete);
router.get('/', authorize('roles', 'read'), userRoleController.getAll);
router.get('/:id', authorize('roles', 'read'), userRoleController.getById);
router.delete('/:id', authorize('roles', 'delete'), userRoleController.delete);

module.exports = router;
