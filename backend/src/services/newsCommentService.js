const { Op } = require('sequelize');
const { NewsComment, News } = require('../models');

class NewsCommentService {
  // Get all approved top-level comments for a news article, with nested replies
  async getCommentsByNews(newsId) {
    try {
      const comments = await NewsComment.findAll({
        where: { newsId, parentId: null, status: 'approved' },
        include: [{
          model: NewsComment,
          as: 'replies',
          where: { status: 'approved' },
          required: false,
          include: [{
            model: NewsComment,
            as: 'replies',
            where: { status: 'approved' },
            required: false
          }]
        }],
        order: [
          ['createdAt', 'ASC'],
          [{ model: NewsComment, as: 'replies' }, 'createdAt', 'ASC'],
          [{ model: NewsComment, as: 'replies' }, { model: NewsComment, as: 'replies' }, 'createdAt', 'ASC']
        ]
      });
      return comments;
    } catch (error) {
      throw new Error(`Error fetching comments: ${error.message}`);
    }
  }

  // Create a new comment (top-level or reply)
  async createComment(newsId, data) {
    try {
      // Verify news exists
      const news = await News.findByPk(newsId);
      if (!news) throw new Error('News article not found.');

      // If parentId given, verify parent belongs to same article
      if (data.parentId) {
        const parent = await NewsComment.findOne({
          where: { id: data.parentId, newsId }
        });
        if (!parent) throw new Error('Parent comment not found.');
      }

      const comment = await NewsComment.create({
        newsId: parseInt(newsId, 10),
        parentId: data.parentId || null,
        authorName: (data.authorName || 'Anonymous').trim().substring(0, 100),
        authorEmail: data.authorEmail ? data.authorEmail.trim().substring(0, 150) : null,
        content: data.content.trim(),
        status: 'approved'
      });

      // Return with empty replies array for consistency
      return { ...comment.toJSON(), replies: [] };
    } catch (error) {
      throw new Error(`Error creating comment: ${error.message}`);
    }
  }

  // Increment likes on a comment
  async likeComment(commentId) {
    try {
      const comment = await NewsComment.findByPk(commentId);
      if (!comment) throw new Error('Comment not found.');
      await comment.increment('likes');
      await comment.reload();
      return comment;
    } catch (error) {
      throw new Error(`Error liking comment: ${error.message}`);
    }
  }

  // Admin: get all comments (paginated, any status)
  async getAllComments({ page = 1, limit = 20, search = '', status, newsId } = {}) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 20;
      const offset = (parsedPage - 1) * parsedLimit;

      const where = {};
      if (status) where.status = status;
      if (newsId) where.newsId = newsId;
      if (search) {
        where[Op.or] = [
          { content: { [Op.like]: `%${search}%` } },
          { authorName: { [Op.like]: `%${search}%` } },
          { authorEmail: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await NewsComment.findAndCountAll({
        where,
        limit: parsedLimit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        totalItems: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parsedPage,
        comments: rows
      };
    } catch (error) {
      throw new Error(`Error fetching all comments: ${error.message}`);
    }
  }

  // Admin: update comment status
  async updateComment(id, data) {
    try {
      const comment = await NewsComment.findByPk(id);
      if (!comment) throw new Error('Comment not found.');
      return await comment.update(data);
    } catch (error) {
      throw new Error(`Error updating comment: ${error.message}`);
    }
  }

  // Delete a comment (and cascades replies)
  async deleteComment(id) {
    try {
      const comment = await NewsComment.findByPk(id);
      if (!comment) throw new Error('Comment not found.');
      await comment.destroy();
      return { message: 'Comment deleted.' };
    } catch (error) {
      throw new Error(`Error deleting comment: ${error.message}`);
    }
  }
}

module.exports = new NewsCommentService();
