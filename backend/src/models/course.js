const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'department_id',
    references: { model: 'departments', key: 'id' }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { notEmpty: true }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
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
  duration: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  level: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'beginner'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
  },
  videoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'video_url'
  },
  badge: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  language: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'English'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  discountPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'discount_price'
  },
  certificateAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'certificate_available'
  },
  learningOutcomes: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'learning_outcomes'
  },
  requirements: {
    type: DataTypes.JSON,
    allowNull: true
  },
  targetAudience: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'target_audience'
  },
  instructorName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'instructor_name'
  },
  instructorTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'instructor_title'
  },
  instructorBio: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'instructor_bio'
  },
  instructorAvatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'instructor_avatar'
  },
  extraData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'extra_data'
  }
}, {
  tableName: 'courses',
  timestamps: true,
  underscored: true
});

module.exports = Course;
