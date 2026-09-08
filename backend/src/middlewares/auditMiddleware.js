const auditTrailService = require('../services/auditTrailService');

/**
 * Express middleware to automatically record all mutating activities in the immutable audit trail
 */
function auditMiddleware(req, res, next) {
  // Capture request start time
  const startTime = Date.now();

  // Clean sensitive fields before logging details
  const sanitizePayload = (body) => {
    if (!body || typeof body !== 'object') return body;
    const sanitized = { ...body };
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.token) sanitized.token = '[REDACTED]';
    return sanitized;
  };

  // Intercept response finish
  res.on('finish', () => {
    try {
      const method = req.method.toUpperCase();
      const path = req.originalUrl || req.url;

      // Skip health check and static media file requests
      if (path.startsWith('/health') || path.startsWith('/media')) {
        return;
      }

      // Action mapping
      let action = method;
      if (method === 'POST') {
        if (path.includes('/login')) action = 'LOGIN';
        else if (path.includes('/register')) action = 'REGISTER';
        else if (path.includes('/bulk-delete')) action = 'BULK_DELETE';
        else action = 'CREATE';
      } else if (method === 'PUT' || method === 'PATCH') {
        action = 'UPDATE';
      } else if (method === 'DELETE') {
        action = 'DELETE';
      } else if (method === 'GET') {
        // Only log GET requests if they fail (e.g. 403 Forbidden or 401 Unauthorized attempts)
        if (res.statusCode < 400) return;
        action = 'READ_ATTEMPT';
      }

      // Infer module name from URL
      let moduleName = 'general';
      const pathSegments = path.replace('/api/', '').split('/');
      if (pathSegments.length > 0 && pathSegments[0]) {
        moduleName = pathSegments[0].split('?')[0];
      }

      const userId = req.user ? req.user.id : null;
      const userName = req.user
        ? `${req.user.firstName || ''} ${req.user.lastName || ''} (${req.user.email})`.trim()
        : (req.body && req.body.email ? req.body.email : 'Anonymous');

      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || null;

      const isSuccess = res.statusCode >= 200 && res.statusCode < 400;

      // Asynchronously log without blocking the response
      auditTrailService.logActivity({
        userId,
        userName,
        action,
        module: moduleName,
        recordId: req.params?.id ? String(req.params.id) : null,
        ipAddress,
        userAgent,
        details: {
          method,
          path,
          params: req.params,
          query: req.query,
          body: sanitizePayload(req.body),
          statusCode: res.statusCode,
          durationMs: Date.now() - startTime
        },
        status: isSuccess ? 'success' : 'failed'
      });
    } catch (err) {
      console.error('Audit logging error:', err.message);
    }
  });

  next();
}

module.exports = auditMiddleware;
