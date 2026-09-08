const moduleService = require('../services/moduleService');

class ModuleController {
  async create(req, res) {
    try {
      const moduleRecord = await moduleService.createModule(req.body);
      res.status(201).json({ success: true, data: moduleRecord });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const moduleRecord = await moduleService.getModuleById(req.params.id);
      res.status(200).json({ success: true, data: moduleRecord });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getByCode(req, res) {
    try {
      const moduleRecord = await moduleService.getModuleByCode(req.params.code);
      res.status(200).json({ success: true, data: moduleRecord });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, isActive, isSystem } = req.query;
      const result = await moduleService.getAllModules({ page, limit, search, isActive, isSystem });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const moduleRecord = await moduleService.updateModule(req.params.id, req.body);
      res.status(200).json({ success: true, data: moduleRecord });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await moduleService.deleteModule(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await moduleService.bulkDeleteModules(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async sync(req, res) {
    try {
      const result = await moduleService.syncModules();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ModuleController();
