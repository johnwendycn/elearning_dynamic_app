const headerService = require('../services/headerService');

class HeaderController {
  async create(req, res) {
    try {
      const header = await headerService.createHeader(req.body);
      res.status(201).json({ success: true, data: header });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getActive(req, res) {
    try {
      const header = await headerService.getActiveHeader();
      res.status(200).json({ success: true, data: header });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const header = await headerService.getHeaderById(req.params.id);
      res.status(200).json({ success: true, data: header });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, status } = req.query;
      const result = await headerService.getAllHeaders({ page, limit, search, status });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const header = await headerService.updateHeader(req.params.id, req.body);
      res.status(200).json({ success: true, data: header });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await headerService.deleteHeader(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await headerService.bulkDeleteHeaders(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new HeaderController();
