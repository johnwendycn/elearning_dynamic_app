const { Op } = require('sequelize');
const { Unit, CourseModule, UnitFile } = require('../models');

class UnitService {
  async createUnit(data) {
    try {
      return await Unit.create(data);
    } catch (error) {
      throw new Error(`Error creating unit: ${error.message}`);
    }
  }

  async getUnitById(id) {
    try {
      const unit = await Unit.findByPk(id, {
        include: [
          { model: CourseModule, as: 'module', attributes: ['id', 'title'] },
          { model: UnitFile, as: 'files', order: [['createdAt', 'ASC']] }
        ]
      });
      if (!unit) throw new Error(`Unit with ID ${id} not found`);
      return unit;
    } catch (error) {
      throw new Error(`Error fetching unit: ${error.message}`);
    }
  }

  async getAllUnits({ page = 1, limit = 10, search = '', status, moduleId } = {}) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) whereClause.title = { [Op.like]: `%${search}%` };
      if (status) whereClause.status = status;
      if (moduleId) whereClause.moduleId = moduleId;

      const { count, rows } = await Unit.findAndCountAll({
        where: whereClause,
        include: [
          { model: CourseModule, as: 'module', attributes: ['id', 'title'] },
          { model: UnitFile, as: 'files' }
        ],
        limit: parsedLimit,
        offset,
        order: [['order', 'ASC'], ['createdAt', 'DESC']]
      });

      return {
        totalItems: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parsedPage,
        limit: parsedLimit,
        units: rows
      };
    } catch (error) {
      throw new Error(`Error fetching units: ${error.message}`);
    }
  }

  async updateUnit(id, data) {
    try {
      const unit = await Unit.findByPk(id);
      if (!unit) throw new Error(`Unit with ID ${id} not found`);
      return await unit.update(data);
    } catch (error) {
      throw new Error(`Error updating unit: ${error.message}`);
    }
  }

  async deleteUnit(id) {
    try {
      const unit = await Unit.findByPk(id);
      if (!unit) throw new Error(`Unit with ID ${id} not found`);
      await unit.destroy();
      return { message: `Unit '${unit.title}' deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting unit: ${error.message}`);
    }
  }

  async bulkDeleteUnits(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0)
        throw new Error('An array of ids must be provided for bulk deletion');
      const deletedCount = await Unit.destroy({ where: { id: { [Op.in]: ids } } });
      return { message: `${deletedCount} unit(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new UnitService();
