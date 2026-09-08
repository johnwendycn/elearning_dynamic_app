const { Op } = require('sequelize');
const { CourseModule, Course, Unit } = require('../models');

class CourseModuleService {
  async createCourseModule(data) {
    try {
      return await CourseModule.create(data);
    } catch (error) {
      throw new Error(`Error creating module: ${error.message}`);
    }
  }

  async getCourseModuleById(id) {
    try {
      const mod = await CourseModule.findByPk(id, {
        include: [
          { model: Course, as: 'course', attributes: ['id', 'title'] },
          { model: Unit, as: 'units', order: [['order', 'ASC']] }
        ]
      });
      if (!mod) throw new Error(`Module with ID ${id} not found`);
      return mod;
    } catch (error) {
      throw new Error(`Error fetching module: ${error.message}`);
    }
  }

  async getAllCourseModules({ page = 1, limit = 10, search = '', status, courseId } = {}) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) whereClause.title = { [Op.like]: `%${search}%` };
      if (status) whereClause.status = status;
      if (courseId) whereClause.courseId = courseId;

      const { count, rows } = await CourseModule.findAndCountAll({
        where: whereClause,
        include: [{ model: Course, as: 'course', attributes: ['id', 'title'] }],
        limit: parsedLimit,
        offset,
        order: [['order', 'ASC'], ['createdAt', 'DESC']]
      });

      return {
        totalItems: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parsedPage,
        limit: parsedLimit,
        modules: rows
      };
    } catch (error) {
      throw new Error(`Error fetching modules: ${error.message}`);
    }
  }

  async updateCourseModule(id, data) {
    try {
      const mod = await CourseModule.findByPk(id);
      if (!mod) throw new Error(`Module with ID ${id} not found`);
      return await mod.update(data);
    } catch (error) {
      throw new Error(`Error updating module: ${error.message}`);
    }
  }

  async deleteCourseModule(id) {
    try {
      const mod = await CourseModule.findByPk(id);
      if (!mod) throw new Error(`Module with ID ${id} not found`);
      await mod.destroy();
      return { message: `Module '${mod.title}' deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting module: ${error.message}`);
    }
  }

  async bulkDeleteCourseModules(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0)
        throw new Error('An array of ids must be provided for bulk deletion');
      const deletedCount = await CourseModule.destroy({ where: { id: { [Op.in]: ids } } });
      return { message: `${deletedCount} module(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new CourseModuleService();
