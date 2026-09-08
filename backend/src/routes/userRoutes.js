const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/', authorize('users', 'create'), userController.create);
router.post('/bulk-delete', authorize('users', 'delete'), userController.bulkDelete);
router.get('/', authorize('users', 'read'), userController.getAll);
router.get('/:id', authorize('users', 'read'), userController.getById);
router.get('/:id/modules', (req, res, next) => {
  // Allow user to fetch their own module list or require 'users:read' permission
  if (req.user && req.user.id === parseInt(req.params.id, 10)) {
    return next();
  }
  return authorize('users', 'read')(req, res, next);
}, userController.getUserModules);
router.put('/:id', (req, res, next) => {
  // Allow user to update their own profile or require 'users:update' permission
  if (req.user && req.user.id === parseInt(req.params.id, 10)) {
    // Prevent non-admin users from modifying their own roles
    const isAdmin = req.user.roles && req.user.roles.some(
      r => r.name === 'Super Admin' || r.name === 'Admin' || (r.name && r.name.toLowerCase().includes('admin')) || r.code === 'admin' || r.code === 'super_admin'
    );
    if (!isAdmin && req.body && req.body.roleIds) {
      delete req.body.roleIds;
    }
    return next();
  }
  return authorize('users', 'update')(req, res, next);
}, userController.update);
router.delete('/:id', authorize('users', 'delete'), userController.delete);

module.exports = router;
