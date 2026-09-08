const courseService = require('../services/courseService');

class CourseController {
  async create(req, res) {
    try {
      const course = await courseService.createCourse(req.body);
      res.status(201).json({ success: true, data: course });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, status, departmentId, level } = req.query;
      const result = await courseService.getAllCourses({ page, limit, search, status, departmentId, level });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getActive(req, res) {
    try {
      const { limit, departmentId, level, search } = req.query;
      const courses = await courseService.getActiveCourses({ limit, departmentId, level, search });
      res.status(200).json({ success: true, data: courses });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getBySlug(req, res) {
    try {
      const course = await courseService.getCourseBySlug(req.params.slug);
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const course = await courseService.getCourseById(req.params.id);
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const course = await courseService.updateCourse(req.params.id, req.body);
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await courseService.deleteCourse(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await courseService.bulkDeleteCourses(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async addReview(req, res) {
    try {
      const reviewData = {
        ...req.body,
        userId: req.user?.id || null,
        reviewerName: req.body.reviewerName || (req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Anonymous Student')
      };
      const review = await courseService.addReview(req.params.id, reviewData);
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getReviews(req, res) {
    try {
      const reviews = await courseService.getReviews(req.params.id);
      res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new CourseController();
