const { Op } = require('sequelize');
const { Role, Module, RoleModule, sequelize } = require('../models');

class RoleService {
  async createRole(data) {
    const t = await sequelize.transaction();
    try {
      const { moduleIds, modules, ...roleFields } = data;
      const role = await Role.create(roleFields, { transaction: t });

      if (Array.isArray(modules) && modules.length > 0) {
        const roleModuleRecords = modules.map((m) => ({
          roleId: role.id,
          moduleId: m.moduleId || m.id,
          permissions: m.permissions || ['read']
        }));
        await RoleModule.bulkCreate(roleModuleRecords, { transaction: t });
      } else if (Array.isArray(moduleIds) && moduleIds.length > 0) {
        await role.setModules(moduleIds, { transaction: t });
      }

      await t.commit();
      return await this.getRoleById(role.id);
    } catch (error) {
      await t.rollback();
      throw new Error(`Error creating role: ${error.message}`);
    }
  }

  async getRoleById(id) {
    try {
      const role = await Role.findByPk(id, {
        include: [
          {
            model: Module,
            as: 'modules',
            through: { attributes: ['permissions'] }
          }
        ]
      });
      if (!role) {
        throw new Error(`Role with ID ${id} not found`);
      }
      return role;
    } catch (error) {
      throw new Error(`Error fetching role: ${error.message}`);
    }
  }

  async getAllRoles({ page = 1, limit = 10, search = '' }) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Role.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Module,
            as: 'modules',
            through: { attributes: ['permissions'] }
          }
        ],
        distinct: true,
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
        roles: rows
      };
    } catch (error) {
      throw new Error(`Error fetching roles: ${error.message}`);
    }
  }

  async updateRole(id, data) {
    const t = await sequelize.transaction();
    try {
      const role = await Role.findByPk(id, { transaction: t });
      if (!role) {
        throw new Error(`Role with ID ${id} not found`);
      }

      const { moduleIds, modules, ...roleFields } = data;

      if (Object.keys(roleFields).length > 0) {
        await role.update(roleFields, { transaction: t });
      }

      if (Array.isArray(modules)) {
        await RoleModule.destroy({ where: { roleId: id }, transaction: t });
        if (modules.length > 0) {
          const roleModuleRecords = modules.map((m) => ({
            roleId: id,
            moduleId: m.moduleId || m.id,
            permissions: m.permissions || ['read']
          }));
          await RoleModule.bulkCreate(roleModuleRecords, { transaction: t });
        }
      } else if (Array.isArray(moduleIds)) {
        await role.setModules(moduleIds, { transaction: t });
      }

      await t.commit();
      return await this.getRoleById(id);
    } catch (error) {
      await t.rollback();
      throw new Error(`Error updating role: ${error.message}`);
    }
  }

  async assignModulesToRole(roleId, modules) {
    const t = await sequelize.transaction();
    try {
      const role = await Role.findByPk(roleId, { transaction: t });
      if (!role) {
        throw new Error(`Role with ID ${roleId} not found`);
      }

      if (Array.isArray(modules)) {
        // If array of numbers/IDs: [1, 2, 3]
        if (modules.length > 0 && typeof modules[0] === 'number') {
          await role.setModules(modules, { transaction: t });
        } else if (modules.length > 0 && typeof modules[0] === 'object') {
          // If array of objects: [{ moduleId: 1, permissions: ['read'] }]
          await RoleModule.destroy({ where: { roleId }, transaction: t });
          const roleModuleRecords = modules.map((m) => ({
            roleId,
            moduleId: m.moduleId || m.id,
            permissions: m.permissions || ['create', 'read', 'update', 'delete']
          }));
          await RoleModule.bulkCreate(roleModuleRecords, { transaction: t });
        } else if (modules.length === 0) {
          await role.setModules([], { transaction: t });
        }
      }

      await t.commit();
      return await this.getRoleById(roleId);
    } catch (error) {
      await t.rollback();
      throw new Error(`Error assigning modules to role: ${error.message}`);
    }
  }

  async deleteRole(id) {
    try {
      const role = await this.getRoleById(id);
      await role.destroy();
      return { message: `Role with ID ${id} deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting role: ${error.message}`);
    }
  }

  async bulkDeleteRoles(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('An array of ids must be provided for bulk deletion');
      }
      const deletedCount = await Role.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      return { message: `${deletedCount} role(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new RoleService();
