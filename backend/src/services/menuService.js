const { Op } = require('sequelize');
const { Menu } = require('../models');

class MenuService {
  async createMenu(data) {
    try {
      return await Menu.create(data);
    } catch (error) {
      throw new Error(`Error creating menu: ${error.message}`);
    }
  }

  async getMenuById(id) {
    try {
      const menu = await Menu.findByPk(id);
      if (!menu) {
        throw new Error(`Menu with ID ${id} not found`);
      }
      return menu;
    } catch (error) {
      throw new Error(`Error fetching menu: ${error.message}`);
    }
  }

  async getMenuByLocation(location) {
    try {
      const menu = await Menu.findOne({
        where: { location, status: 'active' },
        order: [['createdAt', 'DESC']]
      });
      return menu;
    } catch (error) {
      throw new Error(`Error fetching menu for location '${location}': ${error.message}`);
    }
  }

  async getAllMenus({ page = 1, limit = 10, search = '', location, status }) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { location: { [Op.like]: `%${search}%` } }
        ];
      }

      if (location) {
        whereClause.location = location;
      }

      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await Menu.findAndCountAll({
        where: whereClause,
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
        menus: rows
      };
    } catch (error) {
      throw new Error(`Error fetching menus: ${error.message}`);
    }
  }

  async updateMenu(id, data) {
    try {
      const menu = await Menu.findByPk(id);
      if (!menu) {
        throw new Error(`Menu with ID ${id} not found`);
      }
      return await menu.update(data);
    } catch (error) {
      throw new Error(`Error updating menu: ${error.message}`);
    }
  }

  async deleteMenu(id) {
    try {
      const menu = await Menu.findByPk(id);
      if (!menu) {
        throw new Error(`Menu with ID ${id} not found`);
      }
      await menu.destroy();
      return { message: `Menu '${menu.name}' deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting menu: ${error.message}`);
    }
  }

  async bulkDeleteMenus(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('An array of ids must be provided for bulk deletion');
      }
      const deletedCount = await Menu.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      return { message: `${deletedCount} menu(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new MenuService();
