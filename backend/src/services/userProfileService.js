const { Op } = require('sequelize');
const { UserProfile, User } = require('../models');

class UserProfileService {
  async createProfile(data) {
    try {
      return await UserProfile.create(data);
    } catch (error) {
      throw new Error(`Error creating user profile: ${error.message}`);
    }
  }

  async getProfileById(id) {
    try {
      const profile = await UserProfile.findByPk(id, {
        include: [{ model: User, as: 'User' }]
      });
      if (!profile) {
        throw new Error(`User profile with ID ${id} not found`);
      }
      return profile;
    } catch (error) {
      throw new Error(`Error fetching user profile: ${error.message}`);
    }
  }

  async getProfileByUserId(userId) {
    try {
      const profile = await UserProfile.findOne({
        where: { userId },
        include: [{ model: User, as: 'User' }]
      });
      if (!profile) {
        throw new Error(`User profile for user ID ${userId} not found`);
      }
      return profile;
    } catch (error) {
      throw new Error(`Error fetching user profile: ${error.message}`);
    }
  }

  async getAllProfiles({ page = 1, limit = 10, search = '', country, city }) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { phoneNumber: { [Op.like]: `%${search}%` } },
          { bio: { [Op.like]: `%${search}%` } },
          { address: { [Op.like]: `%${search}%` } },
          { city: { [Op.like]: `%${search}%` } },
          { country: { [Op.like]: `%${search}%` } }
        ];
      }

      if (country) {
        whereClause.country = country;
      }

      if (city) {
        whereClause.city = city;
      }

      const { count, rows } = await UserProfile.findAndCountAll({
        where: whereClause,
        include: [{ model: User, as: 'User' }],
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
        profiles: rows
      };
    } catch (error) {
      throw new Error(`Error fetching user profiles: ${error.message}`);
    }
  }

  async updateProfile(id, data) {
    try {
      const profile = await UserProfile.findByPk(id);
      if (!profile) {
        throw new Error(`User profile with ID ${id} not found`);
      }
      return await profile.update(data);
    } catch (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }
  }

  async updateProfileByUserId(userId, data) {
    try {
      const profile = await UserProfile.findOne({ where: { userId } });
      if (!profile) {
        throw new Error(`User profile for user ID ${userId} not found`);
      }
      return await profile.update(data);
    } catch (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }
  }

  async deleteProfile(id) {
    try {
      const profile = await UserProfile.findByPk(id);
      if (!profile) {
        throw new Error(`User profile with ID ${id} not found`);
      }
      await profile.destroy();
      return { message: `User profile with ID ${id} deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting user profile: ${error.message}`);
    }
  }

  async bulkDeleteProfiles(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('An array of ids must be provided for bulk deletion');
      }
      const deletedCount = await UserProfile.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      return { message: `${deletedCount} user profile(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new UserProfileService();
