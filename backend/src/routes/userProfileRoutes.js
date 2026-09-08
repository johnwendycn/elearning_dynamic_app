const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfileController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/', authorize('users', 'create'), userProfileController.create);
router.post('/bulk-delete', authorize('users', 'delete'), userProfileController.bulkDelete);
router.get('/', authorize('users', 'read'), userProfileController.getAll);
router.get('/:id', authorize('users', 'read'), userProfileController.getById);
router.get('/user/:userId', (req, res, next) => {
  if (req.user && req.user.id === parseInt(req.params.userId, 10)) {
    return next();
  }
  return authorize('users', 'read')(req, res, next);
}, userProfileController.getByUserId);
router.put('/:id', authorize('users', 'update'), userProfileController.update);
router.put('/user/:userId', (req, res, next) => {
  if (req.user && req.user.id === parseInt(req.params.userId, 10)) {
    return next();
  }
  return authorize('users', 'update')(req, res, next);
}, userProfileController.updateByUserId);
router.delete('/:id', authorize('users', 'delete'), userProfileController.delete);

module.exports = router;
