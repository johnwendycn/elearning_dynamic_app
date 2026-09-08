const { Op } = require('sequelize');
const { Footer, Menu } = require('../models');

class FooterService {
  async createFooter(data) {
    try {
      const footer = await Footer.create(data);
      if (data.status === 'active') {
        await Footer.update({ status: 'inactive' }, {
          where: {
            id: { [Op.ne]: footer.id }
          }
        });
      }
      return footer;
    } catch (error) {
      throw new Error(`Error creating footer configuration: ${error.message}`);
    }
  }

  async getFooterById(id) {
    try {
      const footer = await Footer.findByPk(id, {
        include: [
          { model: Menu, as: 'column1Menu' },
          { model: Menu, as: 'column2Menu' },
          { model: Menu, as: 'column3Menu' }
        ]
      });
      if (!footer) {
        throw new Error(`Footer configuration with ID ${id} not found`);
      }
      return footer;
    } catch (error) {
      throw new Error(`Error fetching footer configuration: ${error.message}`);
    }
  }

  async getActiveFooter() {
    try {
      const footer = await Footer.findOne({
        where: { status: 'active' },
        include: [
          { model: Menu, as: 'column1Menu' },
          { model: Menu, as: 'column2Menu' },
          { model: Menu, as: 'column3Menu' }
        ],
        order: [['createdAt', 'DESC']]
      });
      return footer;
    } catch (error) {
      throw new Error(`Error fetching active footer configuration: ${error.message}`);
    }
  }

  async getAllFooters({ page = 1, limit = 10, search = '', status }) {
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

      const { count, rows } = await Footer.findAndCountAll({
        where: whereClause,
        include: [
          { model: Menu, as: 'column1Menu' },
          { model: Menu, as: 'column2Menu' },
          { model: Menu, as: 'column3Menu' }
        ],
        limit: parsedLimit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        totalItems: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parsedPage,
        limit: parsedLimit,
        footers: rows
      };
    } catch (error) {
      throw new Error(`Error fetching footers list: ${error.message}`);
    }
  }

  async updateFooter(id, data) {
    try {
      const footer = await Footer.findByPk(id);
      if (!footer) {
        throw new Error(`Footer configuration with ID ${id} not found`);
      }

      await footer.update(data);

      if (data.status === 'active') {
        await Footer.update({ status: 'inactive' }, {
          where: {
            id: { [Op.ne]: id }
          }
        });
      }

      return await this.getFooterById(id);
    } catch (error) {
      throw new Error(`Error updating footer configuration: ${error.message}`);
    }
  }

  async deleteFooter(id) {
    try {
      const footer = await Footer.findByPk(id);
      if (!footer) {
        throw new Error(`Footer configuration with ID ${id} not found`);
      }
      await footer.destroy();
      return { message: 'Footer configuration deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting footer configuration: ${error.message}`);
    }
  }
}

module.exports = new FooterService();
