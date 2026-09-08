const { EventRegistration, Event } = require('../models');
const { Op } = require('sequelize');
const mailer = require('../utils/mailer');

class EventRegistrationService {
  async register(data) {
    const { eventId, firstName, lastName, email, phone, organization, ticketType, notes } = data;
    if (!eventId || !firstName || !lastName || !email) {
      throw new Error('Event ID, first name, last name, and email are required.');
    }

    // Check if already registered
    const existing = await EventRegistration.findOne({ where: { eventId, email } });
    if (existing) {
      throw new Error('You have already registered for this event with this email address.');
    }

    const event = await Event.findByPk(eventId);
    if (!event) throw new Error('Event not found');

    const registration = await EventRegistration.create({
      eventId, firstName, lastName, email, phone, organization,
      ticketType: ticketType || 'free',
      notes,
      status: 'confirmed'
    });

    // Fire-and-forget emails
    mailer.sendEventRegistrationConfirmation(registration, event).catch(() => {});
    mailer.notifyAdminNewRegistration(registration, event).catch(() => {});

    return { registration, event };
  }

  async getByEvent(eventId, { page = 1, limit = 50, search, status } = {}) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { eventId };

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { organization: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await EventRegistration.findAndCountAll({
      where,
      include: [{ model: Event, as: 'event', attributes: ['id', 'title', 'startDate', 'location'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return {
      data: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    };
  }

  async getAll({ page = 1, limit = 50, search, status, eventId } = {}) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (eventId) where.eventId = eventId;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await EventRegistration.findAndCountAll({
      where,
      include: [{ model: Event, as: 'event', attributes: ['id', 'title', 'startDate'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return { data: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) };
  }

  async updateStatus(id, status) {
    const reg = await EventRegistration.findByPk(id);
    if (!reg) throw new Error('Registration not found');
    await reg.update({ status });
    return reg;
  }

  async sendBulkEmail(eventId, subject, body) {
    if (!subject || !body) throw new Error('Subject and body are required');

    const registrations = await EventRegistration.findAll({
      where: { eventId, status: 'confirmed' }
    });

    if (registrations.length === 0) {
      throw new Error('No confirmed registrants found for this event');
    }

    const emails = registrations.map(r => r.email);
    const results = await mailer.sendBulkEventEmail(emails, subject, body);

    const successCount = results.filter(r => r.success).length;
    return {
      total: registrations.length,
      sent: successCount,
      failed: registrations.length - successCount,
      results
    };
  }

  async delete(id) {
    const reg = await EventRegistration.findByPk(id);
    if (!reg) throw new Error('Registration not found');
    await reg.destroy();
    return { message: 'Registration deleted' };
  }
}

module.exports = new EventRegistrationService();
