const { Op } = require('sequelize');
const { News } = require('../models');

class NewsService {
  async createNews(data) {
    try {
      return await News.create(data);
    } catch (error) {
      throw new Error(`Error creating news: ${error.message}`);
    }
  }

  async getNewsById(id) {
    try {
      const news = await News.findByPk(id);
      if (!news) throw new Error(`News with ID ${id} not found`);
      return news;
    } catch (error) {
      throw new Error(`Error fetching news: ${error.message}`);
    }
  }

  async getNewsBySlug(slug) {
    try {
      const news = await News.findOne({ where: { slug } });
      if (!news) throw new Error(`News with slug '${slug}' not found`);
      return news;
    } catch (error) {
      throw new Error(`Error fetching news: ${error.message}`);
    }
  }

  async getAllNews({ page = 1, limit = 10, search = '', status, category } = {}) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { excerpt: { [Op.like]: `%${search}%` } }
        ];
      }
      if (status) whereClause.status = status;
      if (category) whereClause.category = category;

      const { count, rows } = await News.findAndCountAll({
        where: whereClause,
        limit: parsedLimit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        totalItems: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parsedPage,
        limit: parsedLimit,
        news: rows
      };
    } catch (error) {
      throw new Error(`Error fetching news: ${error.message}`);
    }
  }

  async getPublishedNews({ page = 1, limit = 10, category = '', search = '' } = {}) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = { status: 'published' };
      if (category) whereClause.category = category;
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { excerpt: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await News.findAndCountAll({
        where: whereClause,
        limit: parsedLimit,
        offset,
        order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']]
      });

      return {
        totalItems: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parsedPage,
        limit: parsedLimit,
        news: rows
      };
    } catch (error) {
      throw new Error(`Error fetching published news: ${error.message}`);
    }
  }

  async updateNews(id, data) {
    try {
      const news = await News.findByPk(id);
      if (!news) throw new Error(`News with ID ${id} not found`);
      return await news.update(data);
    } catch (error) {
      throw new Error(`Error updating news: ${error.message}`);
    }
  }

  async deleteNews(id) {
    try {
      const news = await News.findByPk(id);
      if (!news) throw new Error(`News with ID ${id} not found`);
      await news.destroy();
      return { message: `News '${news.title}' deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting news: ${error.message}`);
    }
  }

  async bulkDeleteNews(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0)
        throw new Error('An array of ids must be provided for bulk deletion');
      const deletedCount = await News.destroy({ where: { id: { [Op.in]: ids } } });
      return { message: `${deletedCount} news item(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new NewsService();
