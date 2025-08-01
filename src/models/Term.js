const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Term = sequelize.define('Term', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '약관 제목'
  },
  
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '약관 내용'
  },
  
  is_required: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '필수 약관 여부'
  },
  
  version: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: '1.0',
    comment: '약관 버전'
  },
  
  effective_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '시행일'
  },
  
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'terms',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['is_required']
    },
    {
      fields: ['effective_date']
    }
  ]
});

module.exports = Term;
