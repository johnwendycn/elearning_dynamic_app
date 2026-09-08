const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoleModule = sequelize.define('RoleModule', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  moduleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'modules',
      key: 'id'
    }
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: ['create', 'read', 'update', 'delete']
  }
}, {
  tableName: 'role_modules',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['roleId', 'moduleId']
    }
  ]
});

module.exports = RoleModule;
