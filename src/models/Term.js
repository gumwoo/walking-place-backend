const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Term = sequelize.define('Term', {
  termId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    comment: '약관 고유 ID'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '약관 제목'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '약관 내용'
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '필수 약관 여부'
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '약관 버전'
  },
  effectiveDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '약관 시행일'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'terms',
  timestamps: true,
  comment: '이용약관 테이블',
  indexes: [
    {
      fields: ['isRequired']
    },
    {
      fields: ['version']
    },
    {
      fields: ['effectiveDate']
    }
  ]
});

module.exports = Term;
