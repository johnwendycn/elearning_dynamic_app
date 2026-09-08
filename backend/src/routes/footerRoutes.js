const express = require('express');
const router = express.Router();
const footerController = require('../controllers/footerController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public endpoints for website footer
router.get('/active', footerController.getActive);

// Protected footer configuration management
router.post('/', authenticate, authorize('organization', 'create'), footerController.create);
router.get('/', authenticate, authorize('organization', 'read'), footerController.getAll);
router.get('/:id', authenticate, authorize('organization', 'read'), footerController.getById);
router.put('/:id', authenticate, authorize('organization', 'update'), footerController.update);
router.delete('/:id', authenticate, authorize('organization', 'delete'), footerController.delete);

module.exports = router;
