const { Op } = require('sequelize');
const { CarouselSlide, Carousel, Media, sequelize } = require('../models');

class CarouselSlideService {
  async createSlide(data) {
    try {
      const slide = await CarouselSlide.create(data);
      return await this.getSlideById(slide.id);
    } catch (error) {
      throw new Error(`Error creating carousel slide: ${error.message}`);
    }
  }

  async getSlideById(id) {
    try {
      const slide = await CarouselSlide.findByPk(id, {
        include: [
          { model: Carousel, as: 'carousel' },
          { model: Media, as: 'media' }
        ]
      });
      if (!slide) {
        throw new Error(`Carousel slide with ID ${id} not found`);
      }
      return slide;
    } catch (error) {
      throw new Error(`Error fetching carousel slide: ${error.message}`);
    }
  }

  async getSlidesByCarouselId(carouselId) {
    try {
      return await CarouselSlide.findAll({
        where: { carouselId, status: 'active' },
        include: [{ model: Media, as: 'media' }],
        order: [['displayOrder', 'ASC'], ['createdAt', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error fetching slides for carousel ${carouselId}: ${error.message}`);
    }
  }

  async getAllSlides({ page = 1, limit = 10, search = '', carouselId, status }) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { subtitle: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { buttonText: { [Op.like]: `%${search}%` } }
        ];
      }

      if (carouselId) {
        whereClause.carouselId = carouselId;
      }

      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await CarouselSlide.findAndCountAll({
        where: whereClause,
        include: [
          { model: Carousel, as: 'carousel' },
          { model: Media, as: 'media' }
        ],
        limit: parsedLimit,
        offset,
        order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']]
      });

      const totalPages = Math.ceil(count / parsedLimit);

      return {
        totalItems: count,
        totalPages,
        currentPage: parsedPage,
        limit: parsedLimit,
        slides: rows
      };
    } catch (error) {
      throw new Error(`Error fetching carousel slides: ${error.message}`);
    }
  }

  async updateSlide(id, data) {
    try {
      const slide = await CarouselSlide.findByPk(id);
      if (!slide) {
        throw new Error(`Carousel slide with ID ${id} not found`);
      }
      await slide.update(data);
      return await this.getSlideById(id);
    } catch (error) {
      throw new Error(`Error updating carousel slide: ${error.message}`);
    }
  }

  async reorderSlides(carouselId, slideOrders) {
    const t = await sequelize.transaction();
    try {
      if (!Array.isArray(slideOrders)) {
        throw new Error('slideOrders must be an array of { id, displayOrder }');
      }

      for (const item of slideOrders) {
        await CarouselSlide.update(
          { displayOrder: item.displayOrder },
          { where: { id: item.id, carouselId }, transaction: t }
        );
      }

      await t.commit();
      return await this.getSlidesByCarouselId(carouselId);
    } catch (error) {
      await t.rollback();
      throw new Error(`Error reordering slides: ${error.message}`);
    }
  }

  async deleteSlide(id) {
    try {
      const slide = await CarouselSlide.findByPk(id);
      if (!slide) {
        throw new Error(`Carousel slide with ID ${id} not found`);
      }
      await slide.destroy();
      return { message: `Carousel slide with ID ${id} deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting carousel slide: ${error.message}`);
    }
  }

  async bulkDeleteSlides(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('An array of ids must be provided for bulk deletion');
      }
      const deletedCount = await CarouselSlide.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      return { message: `${deletedCount} carousel slide(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new CarouselSlideService();
