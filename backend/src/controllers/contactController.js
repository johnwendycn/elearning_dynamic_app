const contactService = require('../services/contactService');

class ContactController {
  async submit(req, res) {
    try {
      const contact = await contactService.submit(req.body);
      res.status(201).json({ success: true, data: contact, message: 'Message sent successfully! We will get back to you shortly.' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, status } = req.query;
      const result = await contactService.getAll({ page, limit, search, status });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const contact = await contactService.getById(req.params.id);
      res.status(200).json({ success: true, data: contact });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async reply(req, res) {
    try {
      const { replyMessage } = req.body;
      const contact = await contactService.reply(req.params.id, replyMessage);
      res.status(200).json({ success: true, data: contact, message: 'Reply sent successfully!' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await contactService.delete(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await contactService.bulkDelete(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ContactController();
