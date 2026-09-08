const { User, Role, Module, RoleModule, sequelize } = require('./src/models');
const { syncAppModules } = require('./src/utils/moduleSync');
require('dotenv').config();

async function seedSuperAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // 1. Sync Modules
    await syncAppModules();

    // 2. Ensure Super Admin Role exists
    let [superRole] = await Role.findOrCreate({
      where: { name: 'Super Admin' },
      defaults: {
        name: 'Super Admin',
        description: 'Full unrestricted administrative access to all modules and system features',
        isSystem: true
      }
    });

    // 3. Grant Super Admin Role full permissions on all modules
    const allModules = await Module.findAll();
    for (const mod of allModules) {
      await RoleModule.findOrCreate({
        where: { roleId: superRole.id, moduleId: mod.id },
        defaults: {
          roleId: superRole.id,
          moduleId: mod.id,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true
        }
      });
      await RoleModule.update(
        { canCreate: true, canRead: true, canUpdate: true, canDelete: true },
        { where: { roleId: superRole.id, moduleId: mod.id } }
      );
    }

    // 4. Determine Admin Email and Password
    const args = process.argv.slice(2);
    const targetEmail = args[0] || process.env.ADMIN_EMAIL || 'johnwendynwaukwa@gmail.com';
    const targetPassword = args[1] || process.env.ADMIN_PASSWORD || '111111';

    let adminUser = await User.findOne({ where: { email: targetEmail } });
    if (!adminUser) {
      adminUser = await User.create({
        firstName: 'John',
        lastName: 'Wendy',
        email: targetEmail,
        password: targetPassword,
        isActive: true
      });
      console.log(`✅ Created new Super Admin user: ${targetEmail}`);
    } else {
      adminUser.password = targetPassword;
      adminUser.isActive = true;
      await adminUser.save();
      console.log(`✅ Updated existing Super Admin password to 111111 for: ${targetEmail}`);
    }

    // Attach Super Admin role
    await adminUser.setRoles([superRole.id]);

    console.log('\n=============================================');
    console.log('🎉 Super Admin account ready:');
    console.log(`📧 Email:    ${targetEmail}`);
    console.log(`🔑 Password: ${targetPassword}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Super Admin:', error);
    process.exit(1);
  }
}

seedSuperAdmin();
