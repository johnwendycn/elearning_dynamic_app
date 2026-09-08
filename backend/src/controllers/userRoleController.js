const userRoleService = require('../services/userRoleService');

class UserRoleController {
  async assign(req, res) {
    try {
      const result = await userRoleService.assignUserRole(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const userRole = await userRoleService.getUserRoleById(req.params.id);
      res.status(200).json({ success: true, data: userRole });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, userId, roleId } = req.query;
      const result = await userRoleService.getAllUserRoles({ page, limit, userId, roleId });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async remove(req, res) {
    try {
      const { userId, roleId } = req.body;
      const result = await userRoleService.removeUserRole(userId, roleId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await userRoleService.deleteUserRoleById(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await userRoleService.bulkDeleteUserRoles(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new UserRoleController();
