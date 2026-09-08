const { Op } = require('sequelize');
const { UserRole, User, Role } = require('../models');

class UserRoleService {
  async assignUserRole({ userId, roleId }) {
    try {
      const [userRole, created] = await UserRole.findOrCreate({
        where: { userId, roleId },
        defaults: { userId, roleId }
      });
      return { userRole, created };
    } catch (error) {
      throw new Error(`Error assigning role to user: ${error.message}`);
    }
  }

  async getUserRoleById(id) {
    try {
      const userRole = await UserRole.findByPk(id, {
        include: [
          { model: User, as: 'User' },
          { model: Role, as: 'Role' }
        ]
      });
      if (!userRole) {
        throw new Error(`UserRole mapping with ID ${id} not found`);
      }
      return userRole;
    } catch (error) {
      throw new Error(`Error fetching user role mapping: ${error.message}`);
    }
  }

  async getAllUserRoles({ page = 1, limit = 10, userId, roleId }) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (userId) whereClause.userId = userId;
      if (roleId) whereClause.roleId = roleId;

      const { count, rows } = await UserRole.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'User' },
          { model: Role, as: 'Role' }
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
        userRoles: rows
      };
    } catch (error) {
      throw new Error(`Error fetching user roles: ${error.message}`);
    }
  }

  async removeUserRole(userId, roleId) {
    try {
      const userRole = await UserRole.findOne({ where: { userId, roleId } });
      if (!userRole) {
        throw new Error(`Role assignment for user ${userId} and role ${roleId} not found`);
      }
      await userRole.destroy();
      return { message: `Role ${roleId} removed from user ${userId} successfully` };
    } catch (error) {
      throw new Error(`Error removing role from user: ${error.message}`);
    }
  }

  async deleteUserRoleById(id) {
    try {
      const userRole = await UserRole.findByPk(id);
      if (!userRole) {
        throw new Error(`UserRole mapping with ID ${id} not found`);
      }
      await userRole.destroy();
      return { message: `UserRole mapping ${id} deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting user role mapping: ${error.message}`);
    }
  }

  async bulkDeleteUserRoles(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('An array of ids must be provided for bulk deletion');
      }
      const deletedCount = await UserRole.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      return { message: `${deletedCount} user role mapping(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new UserRoleService();
