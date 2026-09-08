const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public: submit a contact form
router.post('/', contactController.submit);

// Admin protected endpoints
router.get('/', authenticate, authorize('users', 'read'), contactController.getAll);
router.get('/:id', authenticate, authorize('users', 'read'), contactController.getById);
router.post('/:id/reply', authenticate, authorize('users', 'read'), contactController.reply);
router.delete('/bulk', authenticate, authorize('users', 'delete'), contactController.bulkDelete);
router.delete('/:id', authenticate, authorize('users', 'delete'), contactController.delete);

module.exports = router;
