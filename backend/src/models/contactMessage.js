const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContactMessage = sequelize.define('ContactMessage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { notEmpty: true }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { notEmpty: true }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { notEmpty: true }
  },
  status: {
    type: DataTypes.ENUM('new', 'read', 'replied'),
    allowNull: false,
    defaultValue: 'new'
  },
  replyMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'reply_message'
  },
  repliedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'replied_at'
  }
}, {
  tableName: 'contact_messages',
  timestamps: true,
  underscored: true
});

module.exports = ContactMessage;
