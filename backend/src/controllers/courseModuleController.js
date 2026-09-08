const courseModuleService = require('../services/courseModuleService');

class CourseModuleController {
  async create(req, res) {
    try {
      const mod = await courseModuleService.createCourseModule(req.body);
      res.status(201).json({ success: true, data: mod });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, status, courseId } = req.query;
      const result = await courseModuleService.getAllCourseModules({ page, limit, search, status, courseId });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const mod = await courseModuleService.getCourseModuleById(req.params.id);
      res.status(200).json({ success: true, data: mod });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const mod = await courseModuleService.updateCourseModule(req.params.id, req.body);
      res.status(200).json({ success: true, data: mod });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await courseModuleService.deleteCourseModule(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await courseModuleService.bulkDeleteCourseModules(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new CourseModuleController();
