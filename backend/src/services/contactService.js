const { ContactMessage } = require('../models');
const { Op } = require('sequelize');
const mailer = require('../utils/mailer');

class ContactService {
  async submit(data) {
    const { name, email, phone, subject, message } = data;
    if (!name || !email || !subject || !message) {
      throw new Error('Name, email, subject, and message are required.');
    }

    const contact = await ContactMessage.create({ name, email, phone, subject, message });

    // Fire-and-forget emails (non-blocking)
    mailer.sendContactConfirmation(contact).catch(() => {});
    mailer.notifyAdminNewContact(contact).catch(() => {});

    return contact;
  }

  async getAll({ page = 1, limit = 20, search, status } = {}) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await ContactMessage.findAndCountAll({
      where,
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

  async getById(id) {
    const contact = await ContactMessage.findByPk(id);
    if (!contact) throw new Error('Contact message not found');

    // Mark as read
    if (contact.status === 'new') {
      await contact.update({ status: 'read' });
    }
    return contact;
  }

  async reply(id, replyMessage) {
    if (!replyMessage || !replyMessage.trim()) {
      throw new Error('Reply message cannot be empty');
    }

    const contact = await ContactMessage.findByPk(id);
    if (!contact) throw new Error('Contact message not found');

    await contact.update({
      status: 'replied',
      replyMessage: replyMessage.trim(),
      repliedAt: new Date()
    });

    await mailer.sendContactReply(contact, replyMessage.trim());
    return contact.reload();
  }

  async delete(id) {
    const contact = await ContactMessage.findByPk(id);
    if (!contact) throw new Error('Contact message not found');
    await contact.destroy();
    return { message: 'Contact message deleted' };
  }

  async bulkDelete(ids) {
    await ContactMessage.destroy({ where: { id: ids } });
    return { message: `${ids.length} messages deleted` };
  }
}

module.exports = new ContactService();
