const subscriberService = require('../services/subscriberService');

class SubscriberController {
  // Public: subscribe
  async subscribe(req, res) {
    try {
      const result = await subscriberService.subscribe(req.body);
      res.status(200).json({ success: true, data: result.subscriber, message: result.message });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Public: unsubscribe via email (supports body or query param)
  async unsubscribe(req, res) {
    try {
      const email = req.body.email || req.query.email;
      if (!email) return res.status(400).json({ success: false, error: 'Email is required to unsubscribe.' });
      const result = await subscriberService.unsubscribe(email);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Admin: Broadcast push email announcement / newsletter
  async broadcast(req, res) {
    try {
      const { subject, title, type, content, recipientType, subscriberIds } = req.body;
      const result = await subscriberService.broadcastToSubscribers({
        subject,
        title,
        type,
        content,
        recipientType,
        subscriberIds
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Admin: get all
  async getAll(req, res) {
    try {
      const { page, limit, search, status } = req.query;
      const result = await subscriberService.getAllSubscribers({ page, limit, search, status });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Admin: get by ID
  async getById(req, res) {
    try {
      const subscriber = await subscriberService.getSubscriberById(req.params.id);
      res.status(200).json({ success: true, data: subscriber });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  // Admin: update
  async update(req, res) {
    try {
      const subscriber = await subscriberService.updateSubscriber(req.params.id, req.body);
      res.status(200).json({ success: true, data: subscriber });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Admin: delete
  async delete(req, res) {
    try {
      const result = await subscriberService.deleteSubscriber(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Admin: bulk delete
  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await subscriberService.bulkDelete(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Admin: stats
  async getStats(req, res) {
    try {
      const stats = await subscriberService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new SubscriberController();
