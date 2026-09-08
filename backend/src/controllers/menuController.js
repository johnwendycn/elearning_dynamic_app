const menuService = require('../services/menuService');

class MenuController {
  async create(req, res) {
    try {
      const menu = await menuService.createMenu(req.body);
      res.status(201).json({ success: true, data: menu });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const menu = await menuService.getMenuById(req.params.id);
      res.status(200).json({ success: true, data: menu });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getByLocation(req, res) {
    try {
      const menu = await menuService.getMenuByLocation(req.params.location);
      res.status(200).json({ success: true, data: menu });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, location, status } = req.query;
      const result = await menuService.getAllMenus({ page, limit, search, location, status });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const menu = await menuService.updateMenu(req.params.id, req.body);
      res.status(200).json({ success: true, data: menu });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await menuService.deleteMenu(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await menuService.bulkDeleteMenus(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new MenuController();
