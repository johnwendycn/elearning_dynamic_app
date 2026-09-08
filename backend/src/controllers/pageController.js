const pageService = require('../services/pageService');

class PageController {
  async create(req, res) {
    try {
      const page = await pageService.createPage(req.body, req.user ? req.user.id : null);
      res.status(201).json({ success: true, data: page });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getBySlug(req, res) {
    try {
      const preview = req.query.preview === 'true';
      const page = await pageService.getPageBySlug(req.params.slug, preview);
      res.status(200).json({ success: true, data: page });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getNavigation(req, res) {
    try {
      const pages = await pageService.getNavigationPages();
      res.status(200).json({ success: true, data: pages });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getHomepage(req, res) {
    try {
      const page = await pageService.getHomepage();
      res.status(200).json({ success: true, data: page });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const page = await pageService.getPageById(req.params.id);
      res.status(200).json({ success: true, data: page });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, status, pageType, parentId } = req.query;
      const result = await pageService.getAllPages({ page, limit, search, status, pageType, parentId });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const page = await pageService.updatePage(req.params.id, req.body, req.user ? req.user.id : null);
      res.status(200).json({ success: true, data: page });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await pageService.deletePage(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await pageService.bulkDeletePages(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async approve(req, res) {
    try {
      const page = await pageService.approvePage(req.params.id, req.user ? req.user.id : null);
      res.status(200).json({ success: true, data: page });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async addComment(req, res) {
    try {
      const comment = await pageService.addComment(req.params.id, req.body);
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async addReply(req, res) {
    try {
      const comment = await pageService.addReply(req.params.id, req.params.commentId, req.body);
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new PageController();
