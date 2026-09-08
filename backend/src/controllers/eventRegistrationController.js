const eventRegistrationService = require('../services/eventRegistrationService');

class EventRegistrationController {
  async register(req, res) {
    try {
      const result = await eventRegistrationService.register(req.body);
      res.status(201).json({ success: true, data: result, message: 'Registration successful! Check your email for confirmation.' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getByEvent(req, res) {
    try {
      const { eventId } = req.params;
      const { page, limit, search, status } = req.query;
      const result = await eventRegistrationService.getByEvent(eventId, { page, limit, search, status });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, status, eventId } = req.query;
      const result = await eventRegistrationService.getAll({ page, limit, search, status, eventId });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const result = await eventRegistrationService.updateStatus(req.params.id, status);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async sendBulkEmail(req, res) {
    try {
      const { eventId } = req.params;
      const { subject, body } = req.body;
      const result = await eventRegistrationService.sendBulkEmail(eventId, subject, body);
      res.status(200).json({ success: true, data: result, message: `Email sent to ${result.sent} registrants.` });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await eventRegistrationService.delete(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new EventRegistrationController();
