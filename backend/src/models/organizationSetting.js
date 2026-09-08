const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrganizationSetting = sequelize.define('OrganizationSetting', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  siteName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'site_name',
    validate: {
      notEmpty: true
    }
  },
  siteTagline: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'site_tagline'
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
  faviconMediaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'favicon_media_id',
    references: {
      model: 'media',
      key: 'id'
    }
  },
  phone: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  copyrightText: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'copyright_text'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
  },
  primaryColor: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#3b82f6',
    field: 'primary_color'
  },
  secondaryColor: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#1e3a8a',
    field: 'secondary_color'
  },
  theme: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'light'
  },
  extraSettings: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'extra_settings'
  }
}, {
  tableName: 'organization_settings',
  timestamps: true,
  underscored: true
});

module.exports = OrganizationSetting;
