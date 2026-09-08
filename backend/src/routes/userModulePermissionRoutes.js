const express = require('express');
const router = express.Router();
const userModulePermissionController = require('../controllers/userModulePermissionController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/', authorize('users', 'update'), userModulePermissionController.setPermission);
router.post('/bulk', authorize('users', 'update'), userModulePermissionController.bulkSet);
router.get('/user/:userId', authorize('users', 'read'), userModulePermissionController.getByUserId);
router.delete('/user/:userId/module/:moduleId', authorize('users', 'update'), userModulePermissionController.deletePermission);

module.exports = router;
