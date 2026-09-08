const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Certificate = sequelize.define('Certificate', {
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
  credentialId: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    field: 'credential_id',
  },
  verificationHash: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true,
    field: 'verification_hash',
  },
  recipientName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'recipient_name',
  },
  courseTitle: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'course_title',
  },
  issueDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'issue_date',
  },
  status: {
    type: DataTypes.ENUM('issued', 'revoked'),
    defaultValue: 'issued',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'certificates',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['credential_id'],
    },
    {
      unique: true,
      fields: ['verification_hash'],
    },
    {
      unique: true,
      fields: ['user_id', 'course_id'],
    },
  ],
});

module.exports = Certificate;
