const { Op } = require('sequelize');
const { AuditTrail, User } = require('../models');

class AuditTrailService {
  /**
   * Log an activity in the audit trail (asynchronous, non-blocking)
   */
  async logActivity({
    userId = null,
    userName = 'System',
    action,
    module,
    recordId = null,
    ipAddress = null,
    userAgent = null,
    details = null,
    status = 'success'
  }) {
    try {
      return await AuditTrail.create({
        userId,
        userName,
        action,
        module,
        recordId: recordId ? String(recordId) : null,
        ipAddress,
        userAgent,
        details,
        status
      });
    } catch (error) {
      console.error('❌ Failed to create audit log:', error.message);
      return null;
    }
  }

  async getAuditById(id) {
    try {
      const audit = await AuditTrail.findByPk(id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] }]
      });
      if (!audit) {
        throw new Error(`Audit log record with ID ${id} not found`);
      }
      return audit;
    } catch (error) {
      throw new Error(`Error fetching audit record: ${error.message}`);
    }
  }

  async getAllAudits({
    page = 1,
    limit = 10,
    search = '',
    userId,
    module,
    action,
    status,
    startDate,
    endDate
  }) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { userName: { [Op.like]: `%${search}%` } },
          { action: { [Op.like]: `%${search}%` } },
          { module: { [Op.like]: `%${search}%` } },
          { recordId: { [Op.like]: `%${search}%` } },
          { ipAddress: { [Op.like]: `%${search}%` } }
        ];
      }

      if (userId) {
        whereClause.userId = userId;
      }

      if (module) {
        whereClause.module = module;
      }

      if (action) {
        whereClause.action = action;
      }

      if (status) {
        whereClause.status = status;
      }

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
        if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
      }

      const { count, rows } = await AuditTrail.findAndCountAll({
        where: whereClause,
        include: [{ model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] }],
        limit: parsedLimit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const totalPages = Math.ceil(count / parsedLimit);

      return {
        totalItems: count,
        totalPages,
        currentPage: parsedPage,
        limit: parsedLimit,
        data: rows,
        auditLogs: rows
      };
    } catch (error) {
      throw new Error(`Error fetching audit logs: ${error.message}`);
    }
  }

  async getAuditStats() {
    try {
      const totalEvents = await AuditTrail.count();
      const successEvents = await AuditTrail.count({ where: { status: 'success' } });
      const failedEvents = await AuditTrail.count({ where: { status: 'failed' } });

      return {
        totalEvents,
        successEvents,
        failedEvents
      };
    } catch (error) {
      throw new Error(`Error fetching audit statistics: ${error.message}`);
    }
  }

  // Explicitly block deletion
  async deleteAudit() {
    throw new Error('Audit trail records are strictly immutable and cannot be deleted by any user or administrator.');
  }

  async bulkDeleteAudits() {
    throw new Error('Audit trail records are strictly immutable and cannot be deleted by any user or administrator.');
  }
}

module.exports = new AuditTrailService();
