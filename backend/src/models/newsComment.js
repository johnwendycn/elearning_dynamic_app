const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NewsComment = sequelize.define('NewsComment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  newsId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'news_id'
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id',
    defaultValue: null
  },
  authorName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Anonymous',
    field: 'author_name'
  },
  authorEmail: {
    type: DataTypes.STRING(150),
    allowNull: true,
    field: 'author_email'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { notEmpty: true, len: [1, 2000] }
  },
  likes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('approved', 'pending', 'spam'),
    allowNull: false,
    defaultValue: 'approved'
  }
}, {
  tableName: 'news_comments',
  timestamps: true,
  underscored: true
});

module.exports = NewsComment;
