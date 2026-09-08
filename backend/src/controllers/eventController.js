const eventService = require('../services/eventService');

class EventController {
  async create(req, res) {
    try {
      const event = await eventService.createEvent(req.body);
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, status, category } = req.query;
      const result = await eventService.getAllEvents({ page, limit, search, status, category });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getUpcoming(req, res) {
    try {
      const { limit, search, category } = req.query;
      const events = await eventService.getUpcomingEvents({ limit, search, category });
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const event = await eventService.getEventById(req.params.id);
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getBySlug(req, res) {
    try {
      const event = await eventService.getEventBySlug(req.params.slug);
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const event = await eventService.updateEvent(req.params.id, req.body);
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await eventService.deleteEvent(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await eventService.bulkDeleteEvents(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new EventController();
