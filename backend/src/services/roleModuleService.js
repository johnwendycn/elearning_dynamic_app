const { Op } = require('sequelize');
const { RoleModule, Role, Module } = require('../models');

class RoleModuleService {
  async assignRoleModule({ roleId, moduleId, permissions = ['create', 'read', 'update', 'delete'] }) {
    try {
      const [roleModule, created] = await RoleModule.findOrCreate({
        where: { roleId, moduleId },
        defaults: { roleId, moduleId, permissions }
      });

      if (!created) {
        await roleModule.update({ permissions });
      }

      return await RoleModule.findOne({
        where: { roleId, moduleId },
        include: [
          { model: Role, as: 'Role' },
          { model: Module, as: 'Module' }
        ]
      });
    } catch (error) {
      throw new Error(`Error assigning module to role: ${error.message}`);
    }
  }

  async getRoleModuleById(id) {
    try {
      const roleModule = await RoleModule.findByPk(id, {
        include: [
          { model: Role, as: 'Role' },
          { model: Module, as: 'Module' }
        ]
      });
      if (!roleModule) {
        throw new Error(`RoleModule mapping with ID ${id} not found`);
      }
      return roleModule;
    } catch (error) {
      throw new Error(`Error fetching role module mapping: ${error.message}`);
    }
  }

  async getAllRoleModules({ page = 1, limit = 10, roleId, moduleId }) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (roleId) whereClause.roleId = roleId;
      if (moduleId) whereClause.moduleId = moduleId;

      const { count, rows } = await RoleModule.findAndCountAll({
        where: whereClause,
        include: [
          { model: Role, as: 'Role' },
          { model: Module, as: 'Module' }
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
        roleModules: rows
      };
    } catch (error) {
      throw new Error(`Error fetching role modules: ${error.message}`);
    }
  }

  async updateRoleModule(id, data) {
    try {
      const roleModule = await RoleModule.findByPk(id);
      if (!roleModule) {
        throw new Error(`RoleModule mapping with ID ${id} not found`);
      }
      return await roleModule.update(data);
    } catch (error) {
      throw new Error(`Error updating role module mapping: ${error.message}`);
    }
  }

  async deleteRoleModule(roleId, moduleId) {
    try {
      const roleModule = await RoleModule.findOne({ where: { roleId, moduleId } });
      if (!roleModule) {
        throw new Error(`RoleModule mapping for role ${roleId} and module ${moduleId} not found`);
      }
      await roleModule.destroy();
      return { message: `Module ${moduleId} unassigned from role ${roleId} successfully` };
    } catch (error) {
      throw new Error(`Error removing module from role: ${error.message}`);
    }
  }

  async deleteRoleModuleById(id) {
    try {
      const roleModule = await RoleModule.findByPk(id);
      if (!roleModule) {
        throw new Error(`RoleModule mapping with ID ${id} not found`);
      }
      await roleModule.destroy();
      return { message: `RoleModule mapping with ID ${id} deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting role module mapping: ${error.message}`);
    }
  }

  async bulkDeleteRoleModules(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('An array of ids must be provided for bulk deletion');
      }
      const deletedCount = await RoleModule.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      return { message: `${deletedCount} role module mapping(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new RoleModuleService();
