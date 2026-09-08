const { Op } = require('sequelize');
const { Module } = require('../models');
const { syncAppModules } = require('../utils/moduleSync');

class ModuleService {
  async createModule(data) {
    try {
      return await Module.create(data);
    } catch (error) {
      throw new Error(`Error creating module: ${error.message}`);
    }
  }

  async getModuleById(id) {
    try {
      const moduleRecord = await Module.findByPk(id);
      if (!moduleRecord) {
        throw new Error(`Module with ID ${id} not found`);
      }
      return moduleRecord;
    } catch (error) {
      throw new Error(`Error fetching module: ${error.message}`);
    }
  }

  async getModuleByCode(code) {
    try {
      const moduleRecord = await Module.findOne({ where: { code } });
      if (!moduleRecord) {
        throw new Error(`Module with code '${code}' not found`);
      }
      return moduleRecord;
    } catch (error) {
      throw new Error(`Error fetching module: ${error.message}`);
    }
  }

  async getAllModules({ page = 1, limit = 100, search = '', isActive, isSystem }) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = limit === 'all' || parseInt(limit, 10) === 0 ? 1000 : (parseInt(limit, 10) || 100);
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true' || isActive === true;
      }

      if (isSystem !== undefined) {
        whereClause.isSystem = isSystem === 'true' || isSystem === true;
      }

      const { count, rows } = await Module.findAndCountAll({
        where: whereClause,
        limit: parsedLimit,
        offset,
        order: [['isSystem', 'DESC'], ['name', 'ASC']]
      });

      const totalPages = Math.ceil(count / parsedLimit);

      return {
        totalItems: count,
        totalPages,
        currentPage: parsedPage,
        limit: parsedLimit,
        modules: rows
      };
    } catch (error) {
      throw new Error(`Error fetching modules: ${error.message}`);
    }
  }

  async updateModule(id, data) {
    try {
      const moduleRecord = await this.getModuleById(id);
      return await moduleRecord.update(data);
    } catch (error) {
      throw new Error(`Error updating module: ${error.message}`);
    }
  }

  async deleteModule(id) {
    try {
      const moduleRecord = await this.getModuleById(id);
      if (moduleRecord.isSystem) {
        throw new Error('System modules cannot be deleted');
      }
      await moduleRecord.destroy();
      return { message: `Module '${moduleRecord.name}' deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting module: ${error.message}`);
    }
  }

  async bulkDeleteModules(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('An array of ids must be provided for bulk deletion');
      }

      const deletedCount = await Module.destroy({
        where: {
          id: {
            [Op.in]: ids
          },
          isSystem: false // Protect system modules from accidental bulk deletion
        }
      });

      return {
        message: `${deletedCount} non-system module(s) deleted successfully`,
        deletedCount
      };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }

  async syncModules() {
    await syncAppModules();
    return { message: 'Modules synchronized successfully' };
  }
}

module.exports = new ModuleService();
