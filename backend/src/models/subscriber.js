const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscriber = sequelize.define('Subscriber', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'unsubscribed'),
    allowNull: false,
    defaultValue: 'active'
  },
  source: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'website'
  },
  subscribedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'subscribed_at'
  },
  unsubscribedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'unsubscribed_at'
  }
}, {
  tableName: 'subscribers',
  timestamps: true,
  underscored: true
});

module.exports = Subscriber;
