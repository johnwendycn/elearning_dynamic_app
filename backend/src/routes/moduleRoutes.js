const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/sync', authorize('modules', 'create'), moduleController.sync);
router.post('/bulk-delete', authorize('modules', 'delete'), moduleController.bulkDelete);
router.post('/', authorize('modules', 'create'), moduleController.create);
router.get('/', authorize('modules', 'read'), moduleController.getAll);
router.get('/code/:code', authorize('modules', 'read'), moduleController.getByCode);
router.get('/:id', authorize('modules', 'read'), moduleController.getById);
router.put('/:id', authorize('modules', 'update'), moduleController.update);
router.delete('/:id', authorize('modules', 'delete'), moduleController.delete);

module.exports = router;
