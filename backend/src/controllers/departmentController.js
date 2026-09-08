const departmentService = require('../services/departmentService');

class DepartmentController {
  async create(req, res) {
    try {
      const department = await departmentService.createDepartment(req.body);
      res.status(201).json({ success: true, data: department });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, status } = req.query;
      const result = await departmentService.getAllDepartments({ page, limit, search, status });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getActive(req, res) {
    try {
      const departments = await departmentService.getActiveDepartments();
      res.status(200).json({ success: true, data: departments });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const department = await departmentService.getDepartmentById(req.params.id);
      res.status(200).json({ success: true, data: department });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const department = await departmentService.updateDepartment(req.params.id, req.body);
      res.status(200).json({ success: true, data: department });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await departmentService.deleteDepartment(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await departmentService.bulkDeleteDepartments(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new DepartmentController();
