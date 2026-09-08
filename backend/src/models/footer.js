const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Footer = sequelize.define('Footer', {
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
  copyrightText: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'copyright_text'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'inactive'
  },
  columns: {
    type: DataTypes.JSON,
    allowNull: true
  },
  extraSettings: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'extra_settings'
  }
}, {
  tableName: 'footers',
  timestamps: true,
  underscored: true
});

module.exports = Footer;
