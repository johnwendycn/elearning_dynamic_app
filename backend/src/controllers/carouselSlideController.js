const carouselSlideService = require('../services/carouselSlideService');

class CarouselSlideController {
  async create(req, res) {
    try {
      const slide = await carouselSlideService.createSlide(req.body);
      res.status(201).json({ success: true, data: slide });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const slide = await carouselSlideService.getSlideById(req.params.id);
      res.status(200).json({ success: true, data: slide });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getByCarouselId(req, res) {
    try {
      const slides = await carouselSlideService.getSlidesByCarouselId(req.params.carouselId);
      res.status(200).json({ success: true, data: slides });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, carouselId, status } = req.query;
      const result = await carouselSlideService.getAllSlides({ page, limit, search, carouselId, status });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const slide = await carouselSlideService.updateSlide(req.params.id, req.body);
      res.status(200).json({ success: true, data: slide });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async reorder(req, res) {
    try {
      const { carouselId, slideOrders } = req.body;
      const slides = await carouselSlideService.reorderSlides(carouselId, slideOrders);
      res.status(200).json({ success: true, data: slides });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await carouselSlideService.deleteSlide(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await carouselSlideService.bulkDeleteSlides(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new CarouselSlideController();
