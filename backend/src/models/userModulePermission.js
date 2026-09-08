const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserModulePermission = sequelize.define('UserModulePermission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
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
  isAllowed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'When false, explicitly restricts/blocks the user from accessing this module entirely'
  },
  allowedActions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Extra actions specifically granted to this user for this module'
  },
  deniedActions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Actions explicitly prohibited/restricted for this user (e.g. delete, insert, update, search)'
  }
}, {
  tableName: 'user_module_permissions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'moduleId']
    }
  ]
});

module.exports = UserModulePermission;
