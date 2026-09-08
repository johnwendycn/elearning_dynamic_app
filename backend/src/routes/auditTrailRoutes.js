const express = require('express');
const router = express.Router();
const auditTrailController = require('../controllers/auditTrailController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Read-only endpoints for viewing and analyzing audit logs
router.get('/stats', authorize('audit_trails', 'read'), auditTrailController.getStats);
router.get('/', authorize('audit_trails', 'read'), auditTrailController.getAll);
router.get('/:id', authorize('audit_trails', 'read'), auditTrailController.getById);

// Strictly block any HTTP DELETE / PUT / PATCH / POST requests on audit trails
const blockModification = (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Forbidden: Audit trail logs are strictly immutable and cannot be modified or deleted.'
  });
};

router.delete('*', blockModification);
router.put('*', blockModification);
router.patch('*', blockModification);

module.exports = router;
