const { Op } = require('sequelize');
const { OrganizationSetting, Media } = require('../models');

class OrganizationSettingService {
  async createSetting(data) {
    try {
      return await OrganizationSetting.create(data);
    } catch (error) {
      throw new Error(`Error creating organization setting: ${error.message}`);
    }
  }

  async getSettingById(id) {
    try {
      const setting = await OrganizationSetting.findByPk(id, {
        include: [
          { model: Media, as: 'logoMedia' },
          { model: Media, as: 'faviconMedia' }
        ]
      });
      if (!setting) {
        throw new Error(`Organization setting with ID ${id} not found`);
      }
      return setting;
    } catch (error) {
      throw new Error(`Error fetching organization setting: ${error.message}`);
    }
  }

  async getAllSettings({ page = 1, limit = 10, search = '', status }) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { siteName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { address: { [Op.like]: `%${search}%` } }
        ];
      }

      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await OrganizationSetting.findAndCountAll({
        where: whereClause,
        include: [
          { model: Media, as: 'logoMedia' },
          { model: Media, as: 'faviconMedia' }
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
        settings: rows
      };
    } catch (error) {
      throw new Error(`Error fetching organization settings: ${error.message}`);
    }
  }

  async updateSetting(id, data) {
    try {
      const setting = await this.getSettingById(id);
      return await setting.update(data);
    } catch (error) {
      throw new Error(`Error updating organization setting: ${error.message}`);
    }
  }

  async deleteSetting(id) {
    try {
      const setting = await this.getSettingById(id);
      await setting.destroy();
      return { message: `Organization setting with ID ${id} deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting organization setting: ${error.message}`);
    }
  }

  async bulkDeleteSettings(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('An array of ids must be provided for bulk deletion');
      }
      const deletedCount = await OrganizationSetting.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      return { message: `${deletedCount} organization setting(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new OrganizationSettingService();

