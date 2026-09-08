const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UnitProgress = sequelize.define('UnitProgress', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  unitId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'unit_id',
    references: {
      model: 'units',
      key: 'id',
    },
    onDelete: 'CASCADE',
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
  status: {
    type: DataTypes.ENUM('in_progress', 'completed'),
    defaultValue: 'completed',
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    field: 'score',
  },
  watched: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'watched',
  },
  exerciseAnswers: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'exercise_answers',
  },
  completedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'completed_at',
  },
}, {
  tableName: 'unit_progresses',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'unit_id'],
    },
  ],
});

module.exports = UnitProgress;
