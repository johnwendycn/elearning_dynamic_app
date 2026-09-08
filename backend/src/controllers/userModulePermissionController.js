const userModulePermissionService = require('../services/userModulePermissionService');

class UserModulePermissionController {
  async setPermission(req, res) {
    try {
      const permission = await userModulePermissionService.setPermission(req.body);
      res.status(200).json({ success: true, data: permission });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getByUserId(req, res) {
    try {
      const permissions = await userModulePermissionService.getPermissionsByUserId(req.params.userId);
      res.status(200).json({ success: true, data: permissions });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async deletePermission(req, res) {
    try {
      const { userId, moduleId } = req.params;
      const result = await userModulePermissionService.deletePermission(userId, moduleId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkSet(req, res) {
    try {
      const { userId, permissions } = req.body;
      const result = await userModulePermissionService.bulkSetPermissions(userId, permissions);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new UserModulePermissionController();
