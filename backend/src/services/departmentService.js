const { Op } = require('sequelize');
const { Department, Course } = require('../models');

class DepartmentService {
  async createDepartment(data) {
    try {
      return await Department.create(data);
    } catch (error) {
      throw new Error(`Error creating department: ${error.message}`);
    }
  }

  async getDepartmentById(id) {
    try {
      const department = await Department.findByPk(id, {
        include: [{ model: Course, as: 'courses' }]
      });
      if (!department) throw new Error(`Department with ID ${id} not found`);
      return department;
    } catch (error) {
      throw new Error(`Error fetching department: ${error.message}`);
    }
  }

  async getAllDepartments({ page = 1, limit = 10, search = '', status } = {}) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) whereClause.name = { [Op.like]: `%${search}%` };
      if (status) whereClause.status = status;

      const { count, rows } = await Department.findAndCountAll({
        where: whereClause,
        limit: parsedLimit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        totalItems: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parsedPage,
        limit: parsedLimit,
        departments: rows
      };
    } catch (error) {
      throw new Error(`Error fetching departments: ${error.message}`);
    }
  }

  async getActiveDepartments() {
    try {
      return await Department.findAll({
        where: { status: 'active' },
        include: [{ model: Course, as: 'courses', where: { status: 'active' }, required: false }],
        order: [['name', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error fetching active departments: ${error.message}`);
    }
  }

  async updateDepartment(id, data) {
    try {
      const department = await Department.findByPk(id);
      if (!department) throw new Error(`Department with ID ${id} not found`);
      return await department.update(data);
    } catch (error) {
      throw new Error(`Error updating department: ${error.message}`);
    }
  }

  async deleteDepartment(id) {
    try {
      const department = await Department.findByPk(id);
      if (!department) throw new Error(`Department with ID ${id} not found`);
      await department.destroy();
      return { message: `Department '${department.name}' deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting department: ${error.message}`);
    }
  }

  async bulkDeleteDepartments(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0)
        throw new Error('An array of ids must be provided for bulk deletion');
      const deletedCount = await Department.destroy({ where: { id: { [Op.in]: ids } } });
      return { message: `${deletedCount} department(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new DepartmentService();
