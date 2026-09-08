const newsService = require('../services/newsService');

class NewsController {
  async create(req, res) {
    try {
      const news = await newsService.createNews(req.body);
      res.status(201).json({ success: true, data: news });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, status, category } = req.query;
      const result = await newsService.getAllNews({ page, limit, search, status, category });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPublished(req, res) {
    try {
      const { page, limit, category, search } = req.query;
      const result = await newsService.getPublishedNews({ page, limit, category, search });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const news = await newsService.getNewsById(req.params.id);
      res.status(200).json({ success: true, data: news });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getBySlug(req, res) {
    try {
      const news = await newsService.getNewsBySlug(req.params.slug);
      res.status(200).json({ success: true, data: news });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const news = await newsService.updateNews(req.params.id, req.body);
      res.status(200).json({ success: true, data: news });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await newsService.deleteNews(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await newsService.bulkDeleteNews(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new NewsController();
