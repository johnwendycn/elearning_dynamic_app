const organizationSettingService = require('../services/organizationSettingService');

class OrganizationSettingController {
  async getActive(req, res) {
    try {
      const setting = await organizationSettingService.getActiveSetting();
      res.status(200).json({ success: true, data: setting });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req, res) {
    try {
      const setting = await organizationSettingService.createSetting(req.body);
      res.status(201).json({ success: true, data: setting });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const setting = await organizationSettingService.getSettingById(req.params.id);
      res.status(200).json({ success: true, data: setting });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, status } = req.query;
      const result = await organizationSettingService.getAllSettings({ page, limit, search, status });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const setting = await organizationSettingService.updateSetting(req.params.id, req.body);
      res.status(200).json({ success: true, data: setting });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await organizationSettingService.deleteSetting(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await organizationSettingService.bulkDeleteSettings(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new OrganizationSettingController();
