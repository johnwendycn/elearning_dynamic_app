const express = require('express');
const router = express.Router();
const organizationSettingController = require('../controllers/organizationSettingController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public read
router.get('/active', organizationSettingController.getActive);
router.get('/', organizationSettingController.getAll);
router.get('/:id', organizationSettingController.getById);

// Protected mutation routes
router.post('/', authenticate, authorize('organization_settings', 'create'), organizationSettingController.create);
router.post('/bulk-delete', authenticate, authorize('organization_settings', 'delete'), organizationSettingController.bulkDelete);
router.put('/:id', authenticate, authorize('organization_settings', 'update'), organizationSettingController.update);
router.delete('/:id', authenticate, authorize('organization_settings', 'delete'), organizationSettingController.delete);

module.exports = router;
