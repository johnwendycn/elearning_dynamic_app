const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Carousel = sequelize.define('Carousel', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  autoplay: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  autoplaySpeed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5000,
    field: 'autoplay_speed'
  },
  showArrows: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'show_arrows'
  },
  showIndicators: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'show_indicators'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'carousels',
  timestamps: true,
  underscored: true
});

module.exports = Carousel;
