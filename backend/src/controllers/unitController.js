const unitService = require('../services/unitService');

class UnitController {
  async create(req, res) {
    try {
      const unit = await unitService.createUnit(req.body);
      res.status(201).json({ success: true, data: unit });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, status, moduleId } = req.query;
      const result = await unitService.getAllUnits({ page, limit, search, status, moduleId });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const unit = await unitService.getUnitById(req.params.id);
      res.status(200).json({ success: true, data: unit });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const unit = await unitService.updateUnit(req.params.id, req.body);
      res.status(200).json({ success: true, data: unit });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await unitService.deleteUnit(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await unitService.bulkDeleteUnits(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new UnitController();
