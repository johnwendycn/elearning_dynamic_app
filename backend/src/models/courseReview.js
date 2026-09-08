const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseReview = sequelize.define('CourseReview', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'course_id',
    references: {
      model: 'courses',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  reviewerName: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'reviewer_name',
  },
  reviewerRole: {
    type: DataTypes.STRING(150),
    allowNull: true,
    field: 'reviewer_role',
  },
  reviewerAvatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'reviewer_avatar',
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    validate: { min: 1, max: 5 },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'approved',
  },
}, {
  tableName: 'course_reviews',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['course_id'],
    },
    {
      fields: ['status'],
    }
  ]
});

module.exports = CourseReview;
