const { Module } = require('../models');

/**
 * Complete list of system modules and functional areas in the application
 */
const DEFAULT_MODULES = [
  // ─── SYSTEM & ADMINISTRATION ─────────────────────────
  {
    name: 'Organization Settings',
    code: 'organization_settings',
    route: '/api/organization-settings',
    description: 'Manage organization information, branding, colors, logos, and themes',
    icon: 'building',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'User Accounts',
    code: 'users',
    route: '/api/users',
    description: 'Manage administrator, instructor, and student user accounts',
    icon: 'users',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'Roles & Privileges',
    code: 'roles',
    route: '/api/roles',
    description: 'Configure system roles and granular module-level permission matrices',
    icon: 'shield-check',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'User Privilege Overrides',
    code: 'user_privileges',
    route: '/api/user-module-permissions',
    description: 'Configure custom granular permission overrides and restrictions per individual user',
    icon: 'shield-alert',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'Assign User Roles',
    code: 'assign_roles',
    route: '/api/user-roles',
    description: 'Assign and revoke system roles to registered staff and users',
    icon: 'user-check',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'Audit Trail Logs',
    code: 'audit_trails',
    route: '/api/audit-trails',
    description: 'Immutable system-wide activity tracking, security logs, and audit trails',
    icon: 'clipboard-document-list',
    isSystem: true,
    isActive: true,
    permissions: ['read']
  },
  {
    name: 'Module Registry',
    code: 'modules',
    route: '/api/modules',
    description: 'System module catalog and permission registry',
    icon: 'squares-2x2',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },

  // ─── ACADEMIC & LMS ───────────────────────────────────
  {
    name: 'Department Management',
    code: 'departments',
    route: '/api/departments',
    description: 'Manage academic departments, faculties, and schools',
    icon: 'building',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'Course Management',
    code: 'courses',
    route: '/api/courses',
    description: 'Manage educational courses, curriculum, pricing, and enrollments',
    icon: 'book-open',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'Course Modules',
    code: 'course_modules',
    route: '/api/course-modules',
    description: 'Manage syllabus sections and modules within courses',
    icon: 'folder',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'Unit & Lesson Management',
    code: 'units',
    route: '/api/units',
    description: 'Manage lessons, downloadable resources, lecture videos, and quizzes',
    icon: 'academic-cap',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'Certificates & Verifications',
    code: 'certificates',
    route: '/api/certificates',
    description: 'Issue, view, manage, and verify course completion certificates',
    icon: 'award',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },

  // ─── CONTENT & COMMUNICATION ──────────────────────────
  {
    name: 'Page Management',
    code: 'pages',
    route: '/api/pages',
    description: 'Manage dynamic pages, hierarchies, SEO metadata, templates, and content',
    icon: 'document-text',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'Sliders & Carousels',
    code: 'carousels',
    route: '/api/carousels',
    description: 'Manage homepage hero slides, carousel speed, indicators, and animations',
    icon: 'film',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'News & Announcements',
    code: 'news',
    route: '/api/news',
    description: 'Manage articles, blog posts, press releases, comments, and announcements',
    icon: 'newspaper',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'Events Management',
    code: 'events',
    route: '/api/events',
    description: 'Manage institution events, workshops, attendee registrations, and schedules',
    icon: 'calendar',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'Subscribers & Newsletter',
    code: 'subscribers',
    route: '/api/subscribers',
    description: 'Manage newsletter subscriptions, mailing lists, and subscriber exports',
    icon: 'mail',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'Contact Messages & Inquiries',
    code: 'contacts',
    route: '/api/contacts',
    description: 'Manage customer contact inquiries, support messages, and replies',
    icon: 'message-square',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },

  // ─── LAYOUT & MEDIA ───────────────────────────────────
  {
    name: 'Header Configuration',
    code: 'headers',
    route: '/api/headers',
    description: 'Manage website header display settings, brand logos, and search bar visibility',
    icon: 'layout',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'Footer Configuration',
    code: 'footers',
    route: '/api/footers',
    description: 'Manage website footer display settings, multi-column widgets, and copyright text',
    icon: 'layout',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'Navigation Menus',
    code: 'menus',
    route: '/api/menus',
    description: 'Manage navigation menus across header, footer, and sidebar locations',
    icon: 'bars-3',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'Media Library',
    code: 'media',
    route: '/api/media',
    description: 'Centralized media storage, file uploads, department assets, and image management',
    icon: 'photo',
    isSystem: true,
    isActive: true,
    permissions: ['create', 'read', 'update', 'delete']
  }
];

/**
 * Automatically syncs and persists all application modules into the database
 */
async function syncAppModules() {
  try {
    const { Role, RoleModule } = require('../models');
    console.log('🔄 Checking and syncing application modules...');

    // Find Super Admin and Admin roles
    const adminRoles = await Role.findAll({
      where: {
        name: ['Super Admin', 'Admin']
      }
    });

    for (const mod of DEFAULT_MODULES) {
      const [moduleRecord, created] = await Module.findOrCreate({
        where: { code: mod.code },
        defaults: mod
      });

      if (created) {
        console.log(`✨ Registered new module: [${mod.name}] (${mod.code})`);
      } else {
        await moduleRecord.update({
          name: mod.name,
          route: mod.route,
          description: mod.description,
          icon: mod.icon,
          permissions: mod.permissions,
          isActive: mod.isActive,
          isSystem: mod.isSystem
        });
      }

      // Ensure Admin roles have all privileges for these modules
      for (const adminRole of adminRoles) {
        const [roleMod, rmCreated] = await RoleModule.findOrCreate({
          where: { roleId: adminRole.id, moduleId: moduleRecord.id },
          defaults: {
            roleId: adminRole.id,
            moduleId: moduleRecord.id,
            permissions: mod.permissions
          }
        });

        if (!rmCreated && (!roleMod.permissions || roleMod.permissions.length === 0)) {
          await roleMod.update({ permissions: mod.permissions });
        }
      }
    }

    console.log('✅ Application modules synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing application modules:', error.message);
  }
}

module.exports = {
  syncAppModules,
  DEFAULT_MODULES
};
