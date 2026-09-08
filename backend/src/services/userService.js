const { Op } = require('sequelize');
const { User, UserProfile, Role, Module, Media, UserModulePermission, sequelize } = require('../models');

class UserService {
  async createUser(data) {
    const t = await sequelize.transaction();
    try {
      const { profile, roleIds, ...userFields } = data;

      const user = await User.create(userFields, { transaction: t });

      if (profile) {
        await UserProfile.create({ ...profile, userId: user.id }, { transaction: t });
      } else {
        // Create an empty profile by default
        await UserProfile.create({ userId: user.id }, { transaction: t });
      }

      if (Array.isArray(roleIds) && roleIds.length > 0) {
        await user.setRoles(roleIds, { transaction: t });
      }

      await t.commit();
      return await this.getUserById(user.id);
    } catch (error) {
      await t.rollback();
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findByPk(id, {
        include: [
          { model: UserProfile, as: 'profile' },
          { 
            model: Role, 
            as: 'roles', 
            through: { attributes: [] },
            include: [{ model: Module, as: 'modules' }]
          },
          { model: Media, as: 'profilePicture' }
        ]
      });
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async getAllUsers({ page = 1, limit = 10, search = '', roleId }) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      const roleInclude = {
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      };

      if (roleId) {
        roleInclude.where = { id: roleId };
      }

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        include: [
          { model: UserProfile, as: 'profile' },
          roleInclude,
          { model: Media, as: 'profilePicture' }
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
        users: rows
      };
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  async updateUser(id, data) {
    const t = await sequelize.transaction();
    try {
      const user = await User.findByPk(id, { transaction: t });
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      const { profile, roleIds, ...userFields } = data;

      if (Object.keys(userFields).length > 0) {
        await user.update(userFields, { transaction: t });
      }

      if (profile) {
        const userProfile = await UserProfile.findOne({ where: { userId: id }, transaction: t });
        if (userProfile) {
          await userProfile.update(profile, { transaction: t });
        } else {
          await UserProfile.create({ ...profile, userId: id }, { transaction: t });
        }
      }

      if (Array.isArray(roleIds)) {
        await user.setRoles(roleIds, { transaction: t });
      }

      await t.commit();
      return await this.getUserById(id);
    } catch (error) {
      await t.rollback();
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async getUserModules(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: 'roles',
            include: [
              {
                model: Module,
                as: 'modules',
                where: { isActive: true },
                required: false
              }
            ]
          },
          {
            model: UserModulePermission,
            as: 'customModulePermissions',
            include: [{ model: Module }]
          }
        ]
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Step 1: Aggregate and deduplicate modules across all assigned roles
      const moduleMap = new Map();

      if (user.roles && user.roles.length > 0) {
        for (const role of user.roles) {
          if (role.modules && role.modules.length > 0) {
            for (const mod of role.modules) {
              const rolePermissions = mod.RoleModule?.permissions || mod.permissions || [];
              if (!moduleMap.has(mod.id)) {
                moduleMap.set(mod.id, {
                  id: mod.id,
                  name: mod.name,
                  code: mod.code,
                  route: mod.route,
                  description: mod.description,
                  icon: mod.icon,
                  isSystem: mod.isSystem,
                  isActive: mod.isActive,
                  permissions: [...new Set(rolePermissions)]
                });
              } else {
                // Merge unique permissions
                const existing = moduleMap.get(mod.id);
                existing.permissions = [...new Set([...existing.permissions, ...rolePermissions])];
              }
            }
          }
        }
      }

      // Step 2: Apply user-specific granular overrides & restrictions
      if (user.customModulePermissions && user.customModulePermissions.length > 0) {
        for (const custom of user.customModulePermissions) {
          const modId = custom.moduleId;

          // If explicitly prohibited from accessing the module
          if (custom.isAllowed === false) {
            moduleMap.delete(modId);
            continue;
          }

          const targetModule = custom.Module;
          if (!moduleMap.has(modId) && targetModule && targetModule.isActive) {
            // Module wasn't in roles, but explicitly granted to user
            moduleMap.set(modId, {
              id: targetModule.id,
              name: targetModule.name,
              code: targetModule.code,
              route: targetModule.route,
              description: targetModule.description,
              icon: targetModule.icon,
              isSystem: targetModule.isSystem,
              isActive: targetModule.isActive,
              permissions: Array.isArray(custom.allowedActions) ? [...custom.allowedActions] : []
            });
          }

          if (moduleMap.has(modId)) {
            const entry = moduleMap.get(modId);
            const allowedSet = new Set(entry.permissions);

            // Add specifically granted actions
            if (Array.isArray(custom.allowedActions)) {
              for (const act of custom.allowedActions) {
                allowedSet.add(act);
              }
            }

            // Remove specifically denied actions (restrictions)
            if (Array.isArray(custom.deniedActions)) {
              for (const denied of custom.deniedActions) {
                allowedSet.delete(denied);
              }
            }

            entry.permissions = Array.from(allowedSet);
          }
        }
      }

      return Array.from(moduleMap.values());
    } catch (error) {
      throw new Error(`Error fetching user modules: ${error.message}`);
    }
  }

  async deleteUser(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }
      await user.destroy();
      return { message: `User with ID ${id} deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  async bulkDeleteUsers(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('An array of ids must be provided for bulk deletion');
      }
      const deletedCount = await User.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      return { message: `${deletedCount} user(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new UserService();
