const { Op } = require('sequelize');
const { Subscriber } = require('../models');
const { sendSubscriberWelcomeEmail, sendSubscriberBroadcastEmail } = require('../utils/mailer');

class SubscriberService {
  async subscribe(data) {
    try {
      const { email, name, source } = data;
      if (!email || !email.includes('@')) {
        throw new Error('Please provide a valid email address.');
      }

      // Upsert: if already exists but unsubscribed, re-activate
      const [subscriber, created] = await Subscriber.findOrCreate({
        where: { email: email.toLowerCase().trim() },
        defaults: {
          email: email.toLowerCase().trim(),
          name: name || null,
          source: source || 'website',
          status: 'active',
          subscribedAt: new Date(),
          unsubscribedAt: null
        }
      });

      if (!created) {
        if (subscriber.status === 'unsubscribed') {
          await subscriber.update({ status: 'active', subscribedAt: new Date(), unsubscribedAt: null, name: name || subscriber.name });
          // Asynchronously send welcome back email
          sendSubscriberWelcomeEmail(subscriber).catch(e => console.error('Welcome email error:', e.message));
          return { subscriber, message: 'You have been re-subscribed successfully! Check your email for our welcome kit.' };
        }
        return { subscriber, message: 'You are already subscribed to our mailing list!' };
      }

      // Asynchronously send welcome email
      sendSubscriberWelcomeEmail(subscriber).catch(e => console.error('Welcome email error:', e.message));

      return { subscriber, message: 'Thank you for subscribing! Check your email for our welcome kit.' };
    } catch (error) {
      throw new Error(`Error subscribing: ${error.message}`);
    }
  }

  async unsubscribe(email) {
    try {
      if (!email) throw new Error('Email is required to unsubscribe.');
      const subscriber = await Subscriber.findOne({ where: { email: email.toLowerCase().trim() } });
      if (!subscriber) {
        return { message: 'This email is not currently active on our subscriber list.' };
      }
      await subscriber.update({ status: 'unsubscribed', unsubscribedAt: new Date() });
      return { message: 'You have been successfully unsubscribed from all JONIKWIRIA newsletters and announcements.' };
    } catch (error) {
      throw new Error(`Error unsubscribing: ${error.message}`);
    }
  }

  /**
   * Push / Broadcast news, events, or general announcements to subscribers
   */
  async broadcastToSubscribers({ subject, title, type = 'news', content, recipientType = 'all', subscriberIds = [] }) {
    try {
      if (!subject || !subject.trim()) throw new Error('Broadcast subject line is required.');
      if (!content || !content.trim()) throw new Error('Broadcast message content is required.');

      const whereClause = { status: 'active' };
      if (recipientType === 'selected' && Array.isArray(subscriberIds) && subscriberIds.length > 0) {
        whereClause.id = { [Op.in]: subscriberIds };
      }

      const activeSubscribers = await Subscriber.findAll({
        where: whereClause,
        attributes: ['id', 'email', 'name']
      });

      if (!activeSubscribers.length) {
        throw new Error('No active subscribers found for this broadcast criteria.');
      }

      let sentCount = 0;
      let failedCount = 0;

      // Dispatch broadcast emails
      for (const sub of activeSubscribers) {
        try {
          await sendSubscriberBroadcastEmail({
            to: sub.email,
            name: sub.name,
            subject,
            title: title || subject,
            type,
            content
          });
          sentCount++;
        } catch (err) {
          console.error(`Failed to send broadcast to ${sub.email}:`, err.message);
          failedCount++;
        }
      }

      return {
        success: true,
        message: `Broadcast successfully pushed to ${sentCount} subscriber(s).${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
        totalTargeted: activeSubscribers.length,
        sentCount,
        failedCount,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Error broadcasting announcement: ${error.message}`);
    }
  }

  async getAllSubscribers({ page = 1, limit = 20, search = '', status } = {}) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 20;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { email: { [Op.like]: `%${search}%` } },
          { name: { [Op.like]: `%${search}%` } }
        ];
      }
      if (status) whereClause.status = status;

      const { count, rows } = await Subscriber.findAndCountAll({
        where: whereClause,
        limit: parsedLimit,
        offset,
        order: [['subscribedAt', 'DESC']]
      });

      return {
        totalItems: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parsedPage,
        limit: parsedLimit,
        subscribers: rows
      };
    } catch (error) {
      throw new Error(`Error fetching subscribers: ${error.message}`);
    }
  }

  async getSubscriberById(id) {
    try {
      const subscriber = await Subscriber.findByPk(id);
      if (!subscriber) throw new Error(`Subscriber with ID ${id} not found`);
      return subscriber;
    } catch (error) {
      throw new Error(`Error fetching subscriber: ${error.message}`);
    }
  }

  async updateSubscriber(id, data) {
    try {
      const subscriber = await Subscriber.findByPk(id);
      if (!subscriber) throw new Error(`Subscriber with ID ${id} not found`);
      return await subscriber.update(data);
    } catch (error) {
      throw new Error(`Error updating subscriber: ${error.message}`);
    }
  }

  async deleteSubscriber(id) {
    try {
      const subscriber = await Subscriber.findByPk(id);
      if (!subscriber) throw new Error(`Subscriber with ID ${id} not found`);
      await subscriber.destroy();
      return { message: `Subscriber '${subscriber.email}' deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting subscriber: ${error.message}`);
    }
  }

  async bulkDelete(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0)
        throw new Error('An array of ids must be provided for bulk deletion');
      const deletedCount = await Subscriber.destroy({ where: { id: { [Op.in]: ids } } });
      return { message: `${deletedCount} subscriber(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }

  async getStats() {
    try {
      const total = await Subscriber.count();
      const active = await Subscriber.count({ where: { status: 'active' } });
      const unsubscribed = await Subscriber.count({ where: { status: 'unsubscribed' } });
      return { total, active, unsubscribed };
    } catch (error) {
      throw new Error(`Error fetching subscriber stats: ${error.message}`);
    }
  }
}

module.exports = new SubscriberService();
