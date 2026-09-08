const { Op } = require('sequelize');
const { Event, EventRegistration } = require('../models');

class EventService {
  async createEvent(data) {
    try {
      return await Event.create(data);
    } catch (error) {
      throw new Error(`Error creating event: ${error.message}`);
    }
  }

  async getEventById(id) {
    try {
      const event = await Event.findByPk(id, {
        include: [{ model: EventRegistration, as: 'registrations', attributes: ['id', 'status'] }]
      });
      if (!event) throw new Error(`Event with ID ${id} not found`);
      return event;
    } catch (error) {
      throw new Error(`Error fetching event: ${error.message}`);
    }
  }

  async getEventBySlug(slug) {
    try {
      const event = await Event.findOne({
        where: { slug },
        include: [{ model: EventRegistration, as: 'registrations', attributes: ['id', 'status'] }]
      });
      if (!event) throw new Error(`Event with slug '${slug}' not found`);
      return event;
    } catch (error) {
      throw new Error(`Error fetching event: ${error.message}`);
    }
  }

  async getAllEvents({ page = 1, limit = 10, search = '', status, category } = {}) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { location: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }
      if (status) whereClause.status = status;
      if (category) whereClause.category = category;

      const { count, rows } = await Event.findAndCountAll({
        where: whereClause,
        include: [{ model: EventRegistration, as: 'registrations', attributes: ['id', 'status'] }],
        distinct: true,
        limit: parsedLimit,
        offset,
        order: [['startDate', 'ASC'], ['createdAt', 'DESC']]
      });

      return {
        totalItems: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parsedPage,
        limit: parsedLimit,
        events: rows
      };
    } catch (error) {
      throw new Error(`Error fetching events: ${error.message}`);
    }
  }

  async getUpcomingEvents({ limit = 10, search = '', category = '' } = {}) {
    try {
      const whereClause = {
        status: { [Op.in]: ['upcoming', 'ongoing'] }
      };
      if (category) whereClause.category = category;
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { location: { [Op.like]: `%${search}%` } }
        ];
      }

      return await Event.findAll({
        where: whereClause,
        limit: parseInt(limit, 10) || 10,
        order: [['startDate', 'ASC'], ['createdAt', 'DESC']]
      });
    } catch (error) {
      throw new Error(`Error fetching upcoming events: ${error.message}`);
    }
  }

  async updateEvent(id, data) {
    try {
      const event = await Event.findByPk(id);
      if (!event) throw new Error(`Event with ID ${id} not found`);
      return await event.update(data);
    } catch (error) {
      throw new Error(`Error updating event: ${error.message}`);
    }
  }

  async deleteEvent(id) {
    try {
      const event = await Event.findByPk(id);
      if (!event) throw new Error(`Event with ID ${id} not found`);
      await event.destroy();
      return { message: `Event '${event.title}' deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting event: ${error.message}`);
    }
  }

  async bulkDeleteEvents(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0)
        throw new Error('An array of ids must be provided for bulk deletion');
      const deletedCount = await Event.destroy({ where: { id: { [Op.in]: ids } } });
      return { message: `${deletedCount} event(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new EventService();
