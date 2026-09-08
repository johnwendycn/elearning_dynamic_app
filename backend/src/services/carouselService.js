const { Op } = require('sequelize');
const { Carousel, CarouselSlide, Media } = require('../models');

class CarouselService {
  async createCarousel(data) {
    try {
      return await Carousel.create(data);
    } catch (error) {
      throw new Error(`Error creating carousel: ${error.message}`);
    }
  }

  async getCarouselById(id) {
    try {
      const carousel = await Carousel.findByPk(id, {
        include: [
          {
            model: CarouselSlide,
            as: 'slides',
            include: [{ model: Media, as: 'media' }]
          }
        ],
        order: [[{ model: CarouselSlide, as: 'slides' }, 'displayOrder', 'ASC']]
      });
      if (!carousel) {
        throw new Error(`Carousel with ID ${id} not found`);
      }
      return carousel;
    } catch (error) {
      throw new Error(`Error fetching carousel: ${error.message}`);
    }
  }

  async getActiveCarousels() {
    try {
      return await Carousel.findAll({
        where: { status: 'active' },
        include: [
          {
            model: CarouselSlide,
            as: 'slides',
            where: { status: 'active' },
            required: false,
            include: [{ model: Media, as: 'media' }]
          }
        ],
        order: [
          ['createdAt', 'DESC'],
          [{ model: CarouselSlide, as: 'slides' }, 'displayOrder', 'ASC']
        ]
      });
    } catch (error) {
      throw new Error(`Error fetching active carousels: ${error.message}`);
    }
  }

  async getAllCarousels({ page = 1, limit = 10, search = '', status }) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) {
        whereClause.name = {
          [Op.like]: `%${search}%`
        };
      }

      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await Carousel.findAndCountAll({
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
        carousels: rows
      };
    } catch (error) {
      throw new Error(`Error fetching carousels: ${error.message}`);
    }
  }

  async updateCarousel(id, data) {
    try {
      const carousel = await Carousel.findByPk(id);
      if (!carousel) {
        throw new Error(`Carousel with ID ${id} not found`);
      }
      return await carousel.update(data);
    } catch (error) {
      throw new Error(`Error updating carousel: ${error.message}`);
    }
  }

  async deleteCarousel(id) {
    try {
      const carousel = await Carousel.findByPk(id);
      if (!carousel) {
        throw new Error(`Carousel with ID ${id} not found`);
      }
      await carousel.destroy();
      return { message: `Carousel '${carousel.name}' deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting carousel: ${error.message}`);
    }
  }

  async bulkDeleteCarousels(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('An array of ids must be provided for bulk deletion');
      }
      const deletedCount = await Carousel.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      return { message: `${deletedCount} carousel(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new CarouselService();
