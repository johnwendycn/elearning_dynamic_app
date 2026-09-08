const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CarouselSlide = sequelize.define('CarouselSlide', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  carouselId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'carousel_id',
    references: {
      model: 'carousels',
      key: 'id'
    }
  },
  mediaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'media_id',
    references: {
      model: 'media',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  subtitle: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  buttonText: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'button_text'
  },
  buttonUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'button_url'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'display_order'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'carousel_slides',
  timestamps: true,
  underscored: true
});

module.exports = CarouselSlide;
