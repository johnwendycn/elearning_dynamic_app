const carouselService = require('../services/carouselService');

class CarouselController {
  async create(req, res) {
    try {
      const carousel = await carouselService.createCarousel(req.body);
      res.status(201).json({ success: true, data: carousel });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getActive(req, res) {
    try {
      const carousels = await carouselService.getActiveCarousels();
      res.status(200).json({ success: true, data: carousels });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const carousel = await carouselService.getCarouselById(req.params.id);
      res.status(200).json({ success: true, data: carousel });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, status } = req.query;
      const result = await carouselService.getAllCarousels({ page, limit, search, status });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const carousel = await carouselService.updateCarousel(req.params.id, req.body);
      res.status(200).json({ success: true, data: carousel });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await carouselService.deleteCarousel(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await carouselService.bulkDeleteCarousels(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new CarouselController();
