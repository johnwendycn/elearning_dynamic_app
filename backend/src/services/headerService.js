const { Op } = require('sequelize');
const { Header, Media, Menu } = require('../models');

class HeaderService {
  async createHeader(data) {
    try {
      return await Header.create(data);
    } catch (error) {
      throw new Error(`Error creating header configuration: ${error.message}`);
    }
  }

  async getHeaderById(id) {
    try {
      const header = await Header.findByPk(id, {
        include: [
          { model: Media, as: 'logoMedia' },
          { model: Menu, as: 'menu' }
        ]
      });
      if (!header) {
        throw new Error(`Header configuration with ID ${id} not found`);
      }
      return header;
    } catch (error) {
      throw new Error(`Error fetching header configuration: ${error.message}`);
    }
  }

  async getActiveHeader() {
    try {
      const header = await Header.findOne({
        where: { status: 'active' },
        include: [
          { model: Media, as: 'logoMedia' },
          { model: Menu, as: 'menu' }
        ],
        order: [['createdAt', 'DESC']]
      });
      return header;
    } catch (error) {
      throw new Error(`Error fetching active header configuration: ${error.message}`);
    }
  }

  async getAllHeaders({ page = 1, limit = 10, search = '', status }) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) {
        whereClause.name = {
          [Op.like]: `%${search}%`
        };
      }

      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await Header.findAndCountAll({
        where: whereClause,
        include: [
          { model: Media, as: 'logoMedia' },
          { model: Menu, as: 'menu' }
        ],
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
        headers: rows
      };
    } catch (error) {
      throw new Error(`Error fetching headers: ${error.message}`);
    }
  }

  async updateHeader(id, data) {
    try {
      const header = await Header.findByPk(id);
      if (!header) {
        throw new Error(`Header configuration with ID ${id} not found`);
      }
      return await header.update(data);
    } catch (error) {
      throw new Error(`Error updating header configuration: ${error.message}`);
    }
  }

  async deleteHeader(id) {
    try {
      const header = await Header.findByPk(id);
      if (!header) {
        throw new Error(`Header configuration with ID ${id} not found`);
      }
      await header.destroy();
      return { message: `Header configuration '${header.name}' deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting header configuration: ${error.message}`);
    }
  }

  async bulkDeleteHeaders(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('An array of ids must be provided for bulk deletion');
      }
      const deletedCount = await Header.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      return { message: `${deletedCount} header configuration(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new HeaderService();
