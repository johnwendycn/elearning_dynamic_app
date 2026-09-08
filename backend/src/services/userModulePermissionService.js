const { UserModulePermission, Module, User } = require('../models');

class UserModulePermissionService {
  async setPermission({ userId, moduleId, isAllowed = true, allowedActions = [], deniedActions = [] }) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const moduleRecord = await Module.findByPk(moduleId);
      if (!moduleRecord) {
        throw new Error(`Module with ID ${moduleId} not found`);
      }

      const [permission, created] = await UserModulePermission.findOrCreate({
        where: { userId, moduleId },
        defaults: {
          userId,
          moduleId,
          isAllowed,
          allowedActions,
          deniedActions
        }
      });

      if (!created) {
        await permission.update({
          isAllowed,
          allowedActions,
          deniedActions
        });
      }

      return await UserModulePermission.findOne({
        where: { userId, moduleId },
        include: [{ model: Module }]
      });
    } catch (error) {
      throw new Error(`Error setting user module permission: ${error.message}`);
    }
  }

  async getPermissionsByUserId(userId) {
    try {
      return await UserModulePermission.findAll({
        where: { userId },
        include: [{ model: Module }]
      });
    } catch (error) {
      throw new Error(`Error fetching user module permissions: ${error.message}`);
    }
  }

  async deletePermission(userId, moduleId) {
    try {
      const permission = await UserModulePermission.findOne({
        where: { userId, moduleId }
      });

      if (!permission) {
        throw new Error(`No custom permission override found for user ${userId} on module ${moduleId}`);
      }

      await permission.destroy();
      return { message: 'Custom module permission override removed successfully' };
    } catch (error) {
      throw new Error(`Error deleting user module permission: ${error.message}`);
    }
  }

  async bulkSetPermissions(userId, permissionsList) {
    try {
      if (!Array.isArray(permissionsList) || permissionsList.length === 0) {
        throw new Error('An array of permission configurations must be provided');
      }

      const results = [];
      for (const item of permissionsList) {
        const result = await this.setPermission({
          userId,
          moduleId: item.moduleId || item.id,
          isAllowed: item.isAllowed !== undefined ? item.isAllowed : true,
          allowedActions: item.allowedActions || [],
          deniedActions: item.deniedActions || []
        });
        results.push(result);
      }

      return results;
    } catch (error) {
      throw new Error(`Error saving bulk user module permissions: ${error.message}`);
    }
  }
}

module.exports = new UserModulePermissionService();
