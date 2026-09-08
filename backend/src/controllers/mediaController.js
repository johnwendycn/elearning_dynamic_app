const path = require('path');
const mediaService = require('../services/mediaService');

class MediaController {
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const mediaRoot = path.join(__dirname, '..', 'media');
      const relativeFolder = path.relative(mediaRoot, req.file.destination).replace(/\\/g, '/');
      const safeFolder = relativeFolder && relativeFolder !== '.' ? `${relativeFolder}/` : '';
      const fileUrl = `/media/${safeFolder}${req.file.filename}`;

      const mediaData = {
        filename: req.file.filename,
        url: fileUrl,
        mimeType: req.file.mimetype,
        size: req.file.size
      };

      const media = await mediaService.createMedia(mediaData);
      res.status(201).json({ success: true, data: media });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async create(req, res) {
    try {
      const media = await mediaService.createMedia(req.body);
      res.status(201).json({ success: true, data: media });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const media = await mediaService.getMediaById(req.params.id);
      res.status(200).json({ success: true, data: media });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { page, limit, search } = req.query;
      const result = await mediaService.getAllMedia({ page, limit, search });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const media = await mediaService.updateMedia(req.params.id, req.body);
      res.status(200).json({ success: true, data: media });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await mediaService.deleteMedia(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      const result = await mediaService.bulkDeleteMedia(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new MediaController();
