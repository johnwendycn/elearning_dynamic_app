const express = require('express');
const router = express.Router();
const eventRegistrationController = require('../controllers/eventRegistrationController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public: register for an event
router.post('/', eventRegistrationController.register);

// Admin protected endpoints
router.get('/', authenticate, authorize('events', 'read'), eventRegistrationController.getAll);
router.get('/event/:eventId', authenticate, authorize('events', 'read'), eventRegistrationController.getByEvent);
router.post('/event/:eventId/send-email', authenticate, authorize('events', 'update'), eventRegistrationController.sendBulkEmail);
router.put('/:id/status', authenticate, authorize('events', 'update'), eventRegistrationController.updateStatus);
router.delete('/:id', authenticate, authorize('events', 'delete'), eventRegistrationController.delete);

module.exports = router;
