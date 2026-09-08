const auditTrailService = require('../services/auditTrailService');

class AuditTrailController {
  async getAll(req, res) {
    try {
      const {
        page,
        limit,
        search,
        userId,
        module: moduleFilter,
        action,
        status,
        startDate,
        endDate
      } = req.query;

      const result = await auditTrailService.getAllAudits({
        page,
        limit,
        search,
        userId,
        module: moduleFilter,
        action,
        status,
        startDate,
        endDate
      });

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const audit = await auditTrailService.getAuditById(req.params.id);
      res.status(200).json({ success: true, data: audit });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await auditTrailService.getAuditStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AuditTrailController();
