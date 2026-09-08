const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UnitFile = sequelize.define('UnitFile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  unitId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'unit_id',
    references: { model: 'units', key: 'id' }
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'file_name'
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_url'
  },
  fileType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'other',
    field: 'file_type'
    // e.g. pdf, slide, excel, doc, video, image, other
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'file_size'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'unit_files',
  timestamps: true,
  underscored: true
});

module.exports = UnitFile;
