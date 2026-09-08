const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Header = sequelize.define('Header', {
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
  showLogo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'show_logo'
  },
  logoMediaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'logo_media_id',
    references: {
      model: 'media',
      key: 'id'
    }
  },
  showSiteName: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'show_site_name'
  },
  showSearch: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'show_search'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
  },
  extraSettings: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'extra_settings'
  },
  menuId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'menu_id',
    references: {
      model: 'menus',
      key: 'id'
    }
  }
}, {
  tableName: 'headers',
  timestamps: true,
  underscored: true
});

module.exports = Header;
