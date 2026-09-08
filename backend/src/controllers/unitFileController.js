const unitFileService = require('../services/unitFileService');

class UnitFileController {
  async create(req, res) {
    try {
      const file = await unitFileService.createUnitFile(req.body);
      res.status(201).json({ success: true, data: file });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, unitId } = req.query;
      const result = await unitFileService.getAllUnitFiles({ page, limit, search, unitId });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const file = await unitFileService.getUnitFileById(req.params.id);
      res.status(200).json({ success: true, data: file });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const file = await unitFileService.updateUnitFile(req.params.id, req.body);
      res.status(200).json({ success: true, data: file });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await unitFileService.deleteUnitFile(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await unitFileService.bulkDeleteUnitFiles(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new UnitFileController();
