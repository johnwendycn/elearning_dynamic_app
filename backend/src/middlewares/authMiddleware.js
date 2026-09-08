const jwt = require('jsonwebtoken');
const { User, Role, Module, UserModulePermission, Media } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_jwt_key_for_app_auth_2026';

/**
 * Middleware to authenticate requests via JWT Token or X-User-ID header
 */
async function authenticate(req, res, next) {
  try {
    let userId = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token'
        });
      }
    } else if (req.headers['x-user-id']) {
      // Fallback for API client testing / internal communication
      userId = parseInt(req.headers['x-user-id'], 10);
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.'
      });
    }

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          include: [
            {
              model: Module,
              as: 'modules'
            }
          ]
        },
        {
          model: UserModulePermission,
          as: 'customModulePermissions',
          include: [{ model: Module }]
        },
        {
          model: Media,
          as: 'profilePicture'
        }
      ]
    });

    if (!user || user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or is inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Authentication error: ${error.message}`
    });
  }
}

/**
 * Middleware to authorize access based on Role permissions and User-level Privilege Overrides/Restrictions
 * @param {string} moduleCode The code of the module (e.g. 'menus', 'roles', 'users', etc.)
 * @param {string} action The required action ('read', 'create', 'update', 'delete', 'search')
 */
function authorize(moduleCode, action) {
  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      // Check if user is an Administrator / Super Admin
      const hasAdminRole = user.roles && user.roles.some(
        role => role.name === 'Super Admin' || role.name === 'Admin' || (role.name && role.name.toLowerCase().includes('admin')) || role.code === 'admin' || role.code === 'super_admin'
      );

      // Check for user-specific override / restriction first
      let userOverride = null;
      if (user.customModulePermissions && user.customModulePermissions.length > 0) {
        userOverride = user.customModulePermissions.find(
          perm => perm.Module && perm.Module.code === moduleCode
        );
      }

      // 1. If user is explicitly blocked from the entire module
      if (userOverride && userOverride.isAllowed === false) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Your account is restricted from accessing the '${moduleCode}' module.`
        });
      }

      // 2. If user is explicitly restricted from this specific action (e.g. insert / update / delete)
      if (userOverride && Array.isArray(userOverride.deniedActions) && userOverride.deniedActions.includes(action)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Your account is specifically restricted from performing '${action}' on '${moduleCode}'.`
        });
      }

      // 3. If user has explicit individual action grant
      if (userOverride && Array.isArray(userOverride.allowedActions) && userOverride.allowedActions.includes(action)) {
        return next();
      }

      // 4. If user is a super admin and has no specific denial
      if (hasAdminRole) {
        return next();
      }

      // 5. Check role-inherited permissions for the module
      let roleAllowsAction = false;
      if (user.roles && user.roles.length > 0) {
        for (const role of user.roles) {
          if (role.modules && role.modules.length > 0) {
            for (const mod of role.modules) {
              if (mod.code === moduleCode) {
                const rolePermissions = mod.RoleModule?.permissions || mod.permissions || [];
                if (rolePermissions.includes(action)) {
                  roleAllowsAction = true;
                  break;
                }
              }
            }
          }
          if (roleAllowsAction) break;
        }
      }

      if (roleAllowsAction) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Access denied: Insufficient permissions to perform '${action}' on '${moduleCode}'.`
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Authorization error: ${error.message}`
      });
    }
  };
}

module.exports = {
  authenticate,
  authorize,
  JWT_SECRET
};
