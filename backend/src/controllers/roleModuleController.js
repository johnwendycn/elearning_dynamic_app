const roleModuleService = require('../services/roleModuleService');

class RoleModuleController {
  async assign(req, res) {
    try {
      const result = await roleModuleService.assignRoleModule(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const roleModule = await roleModuleService.getRoleModuleById(req.params.id);
      res.status(200).json({ success: true, data: roleModule });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, roleId, moduleId } = req.query;
      const result = await roleModuleService.getAllRoleModules({ page, limit, roleId, moduleId });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await roleModuleService.updateRoleModule(req.params.id, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await roleModuleService.deleteRoleModuleById(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await roleModuleService.bulkDeleteRoleModules(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new RoleModuleController();
