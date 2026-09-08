const userProfileService = require('../services/userProfileService');

class UserProfileController {
  async create(req, res) {
    try {
      const profile = await userProfileService.createProfile(req.body);
      res.status(201).json({ success: true, data: profile });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const profile = await userProfileService.getProfileById(req.params.id);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getByUserId(req, res) {
    try {
      const profile = await userProfileService.getProfileByUserId(req.params.userId);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, country, city } = req.query;
      const result = await userProfileService.getAllProfiles({ page, limit, search, country, city });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const profile = await userProfileService.updateProfile(req.params.id, req.body);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateByUserId(req, res) {
    try {
      const profile = await userProfileService.updateProfileByUserId(req.params.userId, req.body);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await userProfileService.deleteProfile(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await userProfileService.bulkDeleteProfiles(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new UserProfileController();
