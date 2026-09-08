const roleService = require('../services/roleService');

class RoleController {
  async create(req, res) {
    try {
      const role = await roleService.createRole(req.body);
      res.status(201).json({ success: true, data: role });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const role = await roleService.getRoleById(req.params.id);
      res.status(200).json({ success: true, data: role });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search } = req.query;
      const result = await roleService.getAllRoles({ page, limit, search });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const role = await roleService.updateRole(req.params.id, req.body);
      res.status(200).json({ success: true, data: role });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await roleService.deleteRole(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await roleService.bulkDeleteRoles(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async assignModules(req, res) {
    try {
      const { modules } = req.body; // Can be array of IDs: [1, 2] or array of objects [{ moduleId: 1, permissions: [...] }]
      const result = await roleService.assignModulesToRole(req.params.id, modules);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new RoleController();
