const { Op } = require('sequelize');
const { Page, User, sequelize } = require('../models');

/**
 * Utility function to convert strings to clean URL slugs
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

class PageService {
  async createPage(data, userId = null) {
    try {
      const pageData = { ...data };

      if (!pageData.slug && pageData.title) {
        pageData.slug = slugify(pageData.title);
      }

      if (userId) {
        pageData.createdBy = userId;
        pageData.updatedBy = userId;
      }

      if (pageData.status === 'published' && !pageData.publishedAt) {
        pageData.publishedAt = new Date();
      }

      // If set as homepage, reset any other homepage
      if (pageData.isHomepage) {
        await Page.update({ isHomepage: false }, { where: { isHomepage: true } });
      }

      const page = await Page.create(pageData);
      return await this.getPageById(page.id);
    } catch (error) {
      throw new Error(`Error creating page: ${error.message}`);
    }
  }

  async getPageById(id) {
    try {
      const page = await Page.findByPk(id, {
        include: [
          { model: Page, as: 'parent' },
          { model: Page, as: 'children' },
          { model: User, as: 'creator', attributes: ['id', 'email', 'firstName', 'lastName'] },
          { model: User, as: 'updater', attributes: ['id', 'email', 'firstName', 'lastName'] }
        ]
      });
      if (!page) {
        throw new Error(`Page with ID ${id} not found`);
      }
      return page;
    } catch (error) {
      throw new Error(`Error fetching page: ${error.message}`);
    }
  }

  async getPageBySlug(slug, preview = false) {
    try {
      const whereClause = { slug };
      if (!preview) {
        whereClause.status = 'published';
      }
      const page = await Page.findOne({
        where: whereClause,
        include: [
          { model: Page, as: 'parent' },
          {
            model: Page,
            as: 'children',
            where: preview ? {} : { status: 'published' },
            required: false,
            order: [['menuOrder', 'ASC']]
          }
        ]
      });
      if (!page) {
        throw new Error(`Page with slug '${slug}' not found`);
      }
      return page;
    } catch (error) {
      throw new Error(`Error fetching page by slug: ${error.message}`);
    }
  }

  /**
   * Fetches published pages marked for navigation in the dynamic menu
   */
  async getNavigationPages() {
    try {
      return await Page.findAll({
        where: {
          showInMenu: true,
          status: 'published',
          parentId: null // Top-level navigation items
        },
        include: [
          {
            model: Page,
            as: 'children',
            where: { showInMenu: true, status: 'published' },
            required: false,
            order: [['menuOrder', 'ASC']]
          }
        ],
        order: [['menuOrder', 'ASC'], ['title', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error fetching navigation pages: ${error.message}`);
    }
  }

  async getHomepage() {
    try {
      const homepage = await Page.findOne({
        where: { isHomepage: true, status: 'published' }
      });
      return homepage;
    } catch (error) {
      throw new Error(`Error fetching homepage: ${error.message}`);
    }
  }

  async getAllPages({ page = 1, limit = 10, search = '', status, pageType, parentId }) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { slug: { [Op.like]: `%${search}%` } },
          { metaTitle: { [Op.like]: `%${search}%` } },
          { metaDescription: { [Op.like]: `%${search}%` } }
        ];
      }

      if (status) {
        whereClause.status = status;
      }

      if (pageType) {
        whereClause.pageType = pageType;
      }

      if (parentId !== undefined) {
        whereClause.parentId = parentId;
      }

      const { count, rows } = await Page.findAndCountAll({
        where: whereClause,
        include: [
          { model: Page, as: 'parent' },
          { model: User, as: 'creator', attributes: ['id', 'email', 'firstName', 'lastName'] }
        ],
        limit: parsedLimit,
        offset,
        order: [['menuOrder', 'ASC'], ['createdAt', 'DESC']]
      });

      const totalPages = Math.ceil(count / parsedLimit);

      return {
        totalItems: count,
        totalPages,
        currentPage: parsedPage,
        limit: parsedLimit,
        pages: rows
      };
    } catch (error) {
      throw new Error(`Error fetching pages: ${error.message}`);
    }
  }

  async updatePage(id, data, userId = null) {
    try {
      const page = await Page.findByPk(id);
      if (!page) {
        throw new Error(`Page with ID ${id} not found`);
      }

      const updateData = { ...data };

      if (userId) {
        updateData.updatedBy = userId;
      }

      if (updateData.status === 'published' && !page.publishedAt && !updateData.publishedAt) {
        updateData.publishedAt = new Date();
      }

      if (updateData.isHomepage && !page.isHomepage) {
        await Page.update({ isHomepage: false }, { where: { isHomepage: true } });
      }

      await page.update(updateData);
      return await this.getPageById(id);
    } catch (error) {
      throw new Error(`Error updating page: ${error.message}`);
    }
  }

  async deletePage(id) {
    try {
      const page = await Page.findByPk(id);
      if (!page) {
        throw new Error(`Page with ID ${id} not found`);
      }
      await page.destroy();
      return { message: `Page '${page.title}' deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting page: ${error.message}`);
    }
  }

  async bulkDeletePages(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('An array of ids must be provided for bulk deletion');
      }
      const deletedCount = await Page.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      return { message: `${deletedCount} page(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
  async approvePage(id, userId) {
    try {
      const page = await Page.findByPk(id);
      if (!page) {
        throw new Error(`Page with ID ${id} not found`);
      }
      await page.update({
        status: 'published',
        publishedAt: new Date(),
        updatedBy: userId
      });
      return await this.getPageById(id);
    } catch (error) {
      throw new Error(`Error approving page: ${error.message}`);
    }
  }

  async addComment(id, commentData) {
    try {
      const page = await Page.findByPk(id);
      if (!page) {
        throw new Error(`Page with ID ${id} not found`);
      }
      
      const currentComments = page.comments || [];
      const newComment = {
        id: 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        user: commentData.user || 'Anonymous',
        text: commentData.text,
        createdAt: new Date().toISOString(),
        replies: []
      };

      const updatedComments = [...currentComments, newComment];
      await page.update({ comments: updatedComments });
      return newComment;
    } catch (error) {
      throw new Error(`Error adding comment: ${error.message}`);
    }
  }

  async addReply(id, commentId, replyData) {
    try {
      const page = await Page.findByPk(id);
      if (!page) {
        throw new Error(`Page with ID ${id} not found`);
      }
      
      const currentComments = page.comments || [];
      const updatedComments = currentComments.map(c => {
        if (c.id === commentId) {
          const replies = c.replies || [];
          const newReply = {
            id: 'reply_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            user: replyData.user || 'Anonymous',
            text: replyData.text,
            createdAt: new Date().toISOString()
          };
          return {
            ...c,
            replies: [...replies, newReply]
          };
        }
        return c;
      });

      await page.update({ comments: updatedComments });
      return updatedComments.find(c => c.id === commentId);
    } catch (error) {
      throw new Error(`Error adding reply: ${error.message}`);
    }
  }
}

module.exports = new PageService();
