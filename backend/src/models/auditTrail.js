const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditTrail = sequelize.define('AuditTrail', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  userName: {
    type: DataTypes.STRING(150),
    allowNull: true,
    field: 'user_name'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  recordId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'record_id'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'user_agent'
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'success'
  }
}, {
  tableName: 'audit_trails',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeDestroy: () => {
      throw new Error('Audit trail records are strictly immutable and cannot be deleted by any user or administrator.');
    },
    beforeBulkDestroy: () => {
      throw new Error('Audit trail records are strictly immutable and cannot be deleted by any user or administrator.');
    },
    beforeUpdate: () => {
      throw new Error('Audit trail records are strictly immutable and cannot be modified.');
    },
    beforeBulkUpdate: () => {
      throw new Error('Audit trail records are strictly immutable and cannot be modified.');
    }
  }
});

module.exports = AuditTrail;
