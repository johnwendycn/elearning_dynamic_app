const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, UserProfile, Role, Module, UserModulePermission, Media, sequelize } = require('../models');
const { JWT_SECRET } = require('../middlewares/authMiddleware');
const mailer = require('../utils/mailer');

class AuthService {
  /**
   * Register a new user with email verification
   */
  async register(userData, clientOrigin) {
    const t = await sequelize.transaction();
    try {
      const { email, password, firstName, lastName, phone, profile, roleIds } = userData;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        if (!existingUser.isEmailVerified) {
          // If previous registration was unverified, allow updating and resending verification
          const verificationToken = crypto.randomBytes(32).toString('hex');
          const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

          existingUser.firstName = firstName || existingUser.firstName;
          existingUser.lastName = lastName || existingUser.lastName;
          existingUser.password = password; // will be hashed by hook
          existingUser.verificationToken = verificationToken;
          existingUser.verificationTokenExpires = verificationTokenExpires;
          await existingUser.save({ transaction: t });

          if (phone) {
            const userProfile = await UserProfile.findOne({ where: { userId: existingUser.id }, transaction: t });
            if (userProfile) {
              await userProfile.update({ phoneNumber: phone }, { transaction: t });
            } else {
              await UserProfile.create({ userId: existingUser.id, phoneNumber: phone }, { transaction: t });
            }
          }

          await t.commit();

          // Send verification email
          await mailer.sendVerificationEmail(existingUser, verificationToken, clientOrigin);

          return {
            requireVerification: true,
            email: existingUser.email,
            message: 'A verification link has been sent to your email. Please check your inbox and confirm your email to activate your account.'
          };
        }
        throw new Error('An account with this email address already exists. Please log in.');
      }

      // Generate 24-hour verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        isActive: true,
        isEmailVerified: false,
        verificationToken,
        verificationTokenExpires
      }, { transaction: t });

      // Profile creation
      const profileData = {
        userId: user.id,
        ...(profile || {})
      };
      if (phone) {
        profileData.phoneNumber = phone;
      }
      await UserProfile.create(profileData, { transaction: t });

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

      // Dispatch verification email
      await mailer.sendVerificationEmail(user, verificationToken, clientOrigin);

      return {
        requireVerification: true,
        email: user.email,
        message: 'Registration successful! A verification link has been sent to your email. Please confirm your email address to log in.'
      };
    } catch (error) {
      await t.rollback();
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Verify email address using token
   */
  async verifyEmail(token) {
    if (!token) {
      throw new Error('Verification token is required');
    }

    const user = await User.findOne({
      where: {
        verificationToken: token,
        verificationTokenExpires: { [Op.gt]: new Date() }
      },
      include: [
        { model: UserProfile, as: 'profile' },
        { model: Role, as: 'roles' },
        { model: Media, as: 'profilePicture' }
      ]
    });

    if (!user) {
      throw new Error('This verification link is invalid or has expired. Please request a new verification link.');
    }

    user.isEmailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user,
      token: jwtToken,
      message: 'Your email address has been verified successfully!'
    };
  }

  /**
   * Resend verification email
   */
  async resendVerification(email, clientOrigin) {
    if (!email) {
      throw new Error('Email address is required');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('No account found with this email address.');
    }

    if (user.isEmailVerified) {
      return {
        alreadyVerified: true,
        message: 'Your email is already verified. You can log in directly.'
      };
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    await mailer.sendVerificationEmail(user, verificationToken, clientOrigin);

    return {
      success: true,
      message: 'A fresh verification email has been sent. Please check your inbox.'
    };
  }

  /**
   * User login with verification enforcement
   */
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

      // Check email verification status
      if (user.isEmailVerified === false) {
        const error = new Error('Your email address has not been verified yet. Please check your email inbox to verify your account.');
        error.isUnverified = true;
        error.email = user.email;
        throw error;
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
      throw error;
    }
  }

  /**
   * Forgot Password - generate reset token & email
   */
  async forgotPassword(email, clientOrigin) {
    if (!email) {
      throw new Error('Email address is required');
    }

    const user = await User.findOne({ where: { email } });
    if (user && user.isActive !== false) {
      const resetPasswordToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordExpires = resetPasswordExpires;
      await user.save();

      await mailer.sendPasswordResetEmail(user, resetPasswordToken, clientOrigin);
    }

    // Always return success to protect against email enumeration
    return {
      success: true,
      message: 'If an account exists with this email address, password reset instructions have been sent to your inbox.'
    };
  }

  /**
   * Verify whether a password reset token is still valid
   */
  async verifyResetToken(token) {
    if (!token) {
      throw new Error('Password reset token is required');
    }

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      throw new Error('This password reset link is invalid or has expired. Please request a new link.');
    }

    return {
      valid: true,
      email: user.email
    };
  }

  /**
   * Reset Password using token
   */
  async resetPassword(token, newPassword) {
    if (!token || !newPassword) {
      throw new Error('Reset token and new password are required');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      throw new Error('This password reset link is invalid or has expired. Please request a new password reset link.');
    }

    user.password = newPassword; // Will be hashed by Sequelize beforeSave hook
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    // Also mark email as verified if they reset their password via email
    user.isEmailVerified = true;
    await user.save();

    // Send confirmation
    await mailer.sendPasswordResetSuccessEmail(user);

    return {
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    };
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

      user.password = newPassword;
      await user.save();
      return { message: 'Password changed successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new AuthService();

