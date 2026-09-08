const { Op } = require('sequelize');
const { Media } = require('../models');

class MediaService {
  async createMedia(data) {
    try {
      return await Media.create(data);
    } catch (error) {
      throw new Error(`Error creating media record: ${error.message}`);
    }
  }

  async getMediaById(id) {
    try {
      const media = await Media.findByPk(id);
      if (!media) {
        throw new Error(`Media with ID ${id} not found`);
      }
      return media;
    } catch (error) {
      throw new Error(`Error fetching media: ${error.message}`);
    }
  }

  async getAllMedia({ page = 1, limit = 10, search = '' }) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { filename: { [Op.like]: `%${search}%` } },
          { mimeType: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Media.findAndCountAll({
        where: whereClause,
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
        media: rows
      };
    } catch (error) {
      throw new Error(`Error fetching media records: ${error.message}`);
    }
  }

  async updateMedia(id, data) {
    try {
      const media = await this.getMediaById(id);
      return await media.update(data);
    } catch (error) {
      throw new Error(`Error updating media record: ${error.message}`);
    }
  }

  async deleteMedia(id) {
    try {
      const media = await this.getMediaById(id);
      await media.destroy();
      return { message: `Media with ID ${id} deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting media record: ${error.message}`);
    }
  }

  async bulkDeleteMedia(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('An array of ids must be provided for bulk deletion');
      }
      const deletedCount = await Media.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      return { message: `${deletedCount} media record(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new MediaService();
