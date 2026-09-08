const express = require('express');
const router = express.Router();
const newsCommentController = require('../controllers/newsCommentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// ─── Public Routes ─────────────────────────────────────────────────────────────
// Get all approved comments for an article
router.get('/news/:newsId/comments', newsCommentController.getByNews);
// Post a new comment or reply
router.post('/news/:newsId/comments', newsCommentController.create);
// Like a comment
router.post('/comments/:commentId/like', newsCommentController.like);

// ─── Admin Protected Routes ────────────────────────────────────────────────────
router.get('/', authenticate, authorize('news', 'read'), newsCommentController.getAll);
router.put('/:id', authenticate, authorize('news', 'update'), newsCommentController.update);
router.delete('/:id', authenticate, authorize('news', 'delete'), newsCommentController.delete);

module.exports = router;
