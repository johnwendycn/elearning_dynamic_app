const newsCommentService = require('../services/newsCommentService');

class NewsCommentController {
  // Public: get comments for an article
  async getByNews(req, res) {
    try {
      const { newsId } = req.params;
      const comments = await newsCommentService.getCommentsByNews(newsId);
      res.status(200).json({ success: true, data: comments });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Public: post a new comment
  async create(req, res) {
    try {
      const { newsId } = req.params;
      const { authorName, authorEmail, content, parentId } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, error: 'Comment content is required.' });
      }
      const comment = await newsCommentService.createComment(newsId, { authorName, authorEmail, content, parentId });
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Public: like a comment
  async like(req, res) {
    try {
      const { commentId } = req.params;
      const comment = await newsCommentService.likeComment(commentId);
      res.status(200).json({ success: true, data: { likes: comment.likes } });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Admin: get all comments
  async getAll(req, res) {
    try {
      const { page, limit, search, status, newsId } = req.query;
      const result = await newsCommentService.getAllComments({ page, limit, search, status, newsId });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Admin: update comment (e.g., change status)
  async update(req, res) {
    try {
      const comment = await newsCommentService.updateComment(req.params.id, req.body);
      res.status(200).json({ success: true, data: comment });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Admin: delete comment
  async delete(req, res) {
    try {
      const result = await newsCommentService.deleteComment(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new NewsCommentController();
