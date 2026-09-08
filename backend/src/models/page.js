const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Page = sequelize.define('Page', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id',
    references: {
      model: 'pages',
      key: 'id'
    }
  },
  pageType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'standard',
    field: 'page_type'
  },
  template: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'default'
  },
  metaTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'meta_title'
  },
  metaDescription: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'meta_description'
  },
  metaKeywords: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'meta_keywords'
  },
  canonicalUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'canonical_url'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'draft'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'published_at'
  },
  showInMenu: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'show_in_menu'
  },
  menuTitle: {
    type: DataTypes.STRING(150),
    allowNull: true,
    field: 'menu_title'
  },
  menuOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'menu_order'
  },
  isHomepage: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_homepage'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'updated_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  bannerImageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'banner_image_url'
  },
  bannerTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'banner_title'
  },
  bannerSubtitle: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'banner_subtitle'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sections: {
    type: DataTypes.JSON,
    allowNull: true
  },
  chatSettings: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'chat_settings'
  },
  comments: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'pages',
  timestamps: true,
  underscored: true
});

module.exports = Page;
