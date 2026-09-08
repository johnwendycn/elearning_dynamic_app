const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const upload = require('../middlewares/uploadMiddleware');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);

// File upload endpoints grouped by module (accessible by authenticated users)
router.post('/upload', (req, res, next) => {
  if (req.user) return next();
  return authorize('media', 'create')(req, res, next);
}, upload.single('file'), mediaController.uploadFile);

router.post('/upload/:module', (req, res, next) => {
  if (req.user) return next();
  return authorize('media', 'create')(req, res, next);
}, upload.single('file'), mediaController.uploadFile);

router.post('/', authorize('media', 'create'), mediaController.create);
router.post('/bulk-delete', authorize('media', 'delete'), mediaController.bulkDelete);
router.get('/', (req, res, next) => {
  if (req.user) return next();
  return authorize('media', 'read')(req, res, next);
}, mediaController.getAll);
router.get('/:id', (req, res, next) => {
  if (req.user) return next();
  return authorize('media', 'read')(req, res, next);
}, mediaController.getById);
router.put('/:id', authorize('media', 'update'), mediaController.update);
router.delete('/:id', authorize('media', 'delete'), mediaController.delete);

module.exports = router;
