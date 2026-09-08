const { Op } = require('sequelize');
const { UnitFile, Unit } = require('../models');

class UnitFileService {
  async createUnitFile(data) {
    try {
      return await UnitFile.create(data);
    } catch (error) {
      throw new Error(`Error creating unit file: ${error.message}`);
    }
  }

  async getUnitFileById(id) {
    try {
      const file = await UnitFile.findByPk(id, {
        include: [{ model: Unit, as: 'unit', attributes: ['id', 'title'] }]
      });
      if (!file) throw new Error(`Unit file with ID ${id} not found`);
      return file;
    } catch (error) {
      throw new Error(`Error fetching unit file: ${error.message}`);
    }
  }

  async getAllUnitFiles({ page = 1, limit = 10, search = '', unitId } = {}) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) whereClause.fileName = { [Op.like]: `%${search}%` };
      if (unitId) whereClause.unitId = unitId;

      const { count, rows } = await UnitFile.findAndCountAll({
        where: whereClause,
        include: [{ model: Unit, as: 'unit', attributes: ['id', 'title'] }],
        limit: parsedLimit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        totalItems: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parsedPage,
        limit: parsedLimit,
        files: rows
      };
    } catch (error) {
      throw new Error(`Error fetching unit files: ${error.message}`);
    }
  }

  async updateUnitFile(id, data) {
    try {
      const file = await UnitFile.findByPk(id);
      if (!file) throw new Error(`Unit file with ID ${id} not found`);
      return await file.update(data);
    } catch (error) {
      throw new Error(`Error updating unit file: ${error.message}`);
    }
  }

  async deleteUnitFile(id) {
    try {
      const file = await UnitFile.findByPk(id);
      if (!file) throw new Error(`Unit file with ID ${id} not found`);
      await file.destroy();
      return { message: `File '${file.fileName}' deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting unit file: ${error.message}`);
    }
  }

  async bulkDeleteUnitFiles(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0)
        throw new Error('An array of ids must be provided for bulk deletion');
      const deletedCount = await UnitFile.destroy({ where: { id: { [Op.in]: ids } } });
      return { message: `${deletedCount} file(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new UnitFileService();
