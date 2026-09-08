const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Configure dynamic storage by module name
 * Files will be stored in src/media/<moduleName>
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Extract module name from query params, body, or route param; default to 'general'
    const moduleName = req.params.module || req.query.module || req.body.module || 'general';
    // Sanitize module folder name to prevent directory traversal
    const safeModuleName = moduleName.replace(/[^a-zA-Z0-9_-]/g, '');
    const uploadPath = path.join(__dirname, '..', 'media', safeModuleName);

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// File filter (optional - can allow images, documents, etc.)
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;
