const footerService = require('../services/footerService');

class FooterController {
  async create(req, res) {
    try {
      const footer = await footerService.createFooter(req.body);
      res.status(201).json({ success: true, data: footer });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getActive(req, res) {
    try {
      const footer = await footerService.getActiveFooter();
      res.status(200).json({ success: true, data: footer });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const footer = await footerService.getFooterById(req.params.id);
      res.status(200).json({ success: true, data: footer });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, status } = req.query;
      const result = await footerService.getAllFooters({ page, limit, search, status });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const footer = await footerService.updateFooter(req.params.id, req.body);
      res.status(200).json({ success: true, data: footer });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await footerService.deleteFooter(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new FooterController();
