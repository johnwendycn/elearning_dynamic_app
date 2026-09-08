const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Unit = sequelize.define('Unit', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  moduleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'module_id',
    references: { model: 'course_modules', key: 'id' }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { notEmpty: true }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'image_url'
  },
  tutorialText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'tutorial_text'
  },
  videoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'video_url'
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
  },
  exerciseData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'exercise_data'
  },
  passingScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 70,
    field: 'passing_score'
  }
}, {
  tableName: 'units',
  timestamps: true,
  underscored: true
});

module.exports = Unit;
