const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserTermAgreement = sequelize.define('UserTermAgreement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '사용자 ID'
  },
  
  term_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'terms',
      key: 'id'
    },
    comment: '약관 ID'
  },
  
  agreed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '동의 일시'
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
  tableName: 'user_term_agreements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'term_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['term_id']
    }
  ]
});

module.exports = UserTermAgreement;
