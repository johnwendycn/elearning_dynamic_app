const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  location: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
  },
  items: {
    type: DataTypes.JSON,
    allowNull: true
  },
  extraSettings: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'extra_settings'
  }
}, {
  tableName: 'menus',
  timestamps: true,
  underscored: true
});

module.exports = Menu;
