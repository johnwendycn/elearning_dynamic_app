const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, UserProfile, Role, Module, UserModulePermission, Media, sequelize } = require('../models');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

class AuthService {
  async register(userData) {
    const t = await sequelize.transaction();
    try {
      const { email, password, firstName, lastName, profile, roleIds } = userData;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('A user with this email address already exists');
      }

      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        status: 'active'
      }, { transaction: t });

      if (profile) {
        await UserProfile.create({
          userId: user.id,
          ...profile
        }, { transaction: t });
      }

      if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
        await user.setRoles(roleIds, { transaction: t });
      } else {
        // Auto assign or create Student role
        const [studentRole] = await Role.findOrCreate({
          where: { name: 'Student' },
          defaults: {
            name: 'Student',
            description: 'Registered learner with access to free courses, phased LMS player, and verifiable certificates',
            permissions: ['read'],
            isActive: true
          },
          transaction: t
        });
        await user.setRoles([studentRole.id], { transaction: t });
      }

      await t.commit();

      const createdUser = await User.findByPk(user.id, {
        include: [
          { model: UserProfile, as: 'profile' },
          { model: Role, as: 'roles' },
          { model: Media, as: 'profilePicture' }
        ]
      });

      const token = jwt.sign(
        { id: createdUser.id, email: createdUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        user: createdUser,
        token
      };
    } catch (error) {
      await t.rollback();
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async login(email, password) {
    try {
      const user = await User.findOne({
        where: { email },
        include: [
          { model: UserProfile, as: 'profile' },
          {
            model: Role,
            as: 'roles',
            include: [{ model: Module, as: 'modules' }]
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

      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (user.isActive === false) {
        throw new Error('User account is inactive or deactivated');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        user,
        token
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async getMe(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [
          { model: UserProfile, as: 'profile' },
          {
            model: Role,
            as: 'roles',
            include: [{ model: Module, as: 'modules' }]
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

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error(`Error fetching user profile: ${error.message}`);
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) throw new Error('Current password is incorrect');

      if (!newPassword || newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      const hashed = await bcrypt.hash(newPassword, 12);
      await user.update({ password: hashed });
      return { message: 'Password changed successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new AuthService();
