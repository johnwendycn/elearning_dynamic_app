const express = require('express');
const router = express.Router();
const carouselSlideController = require('../controllers/carouselSlideController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/reorder', authorize('carousels', 'update'), carouselSlideController.reorder);
router.post('/bulk-delete', authorize('carousels', 'delete'), carouselSlideController.bulkDelete);
router.post('/', authorize('carousels', 'create'), carouselSlideController.create);
router.get('/', authorize('carousels', 'read'), carouselSlideController.getAll);
router.get('/carousel/:carouselId', authorize('carousels', 'read'), carouselSlideController.getByCarouselId);
router.get('/:id', authorize('carousels', 'read'), carouselSlideController.getById);
router.put('/:id', authorize('carousels', 'update'), carouselSlideController.update);
router.delete('/:id', authorize('carousels', 'delete'), carouselSlideController.delete);

module.exports = router;
