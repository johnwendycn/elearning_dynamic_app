const authService = require('../services/authService');

class AuthController {
  async register(req, res) {
    try {
      const clientOrigin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);
      const result = await authService.register(req.body, clientOrigin);
      res.status(201).json({
        success: true,
        message: result.message || 'User registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.body.token ? req.body : req.query;
      const result = await authService.verifyEmail(token);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async resendVerification(req, res) {
    try {
      const { email } = req.body;
      const clientOrigin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);
      const result = await authService.resendVerification(email, clientOrigin);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }
      const result = await authService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      if (error.isUnverified) {
        return res.status(403).json({
          success: false,
          isUnverified: true,
          email: error.email,
          error: error.message
        });
      }
      res.status(401).json({ success: false, error: error.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const clientOrigin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);
      const result = await authService.forgotPassword(email, clientOrigin);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async verifyResetToken(req, res) {
    try {
      const token = req.params.token || req.query.token;
      const result = await authService.verifyResetToken(token);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getMe(req, res) {
    try {
      const user = await authService.getMe(req.user.id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: 'Current password and new password are required' });
      }
      const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AuthController();

