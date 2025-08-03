const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Breed = sequelize.define('Breed', {
  breed_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    comment: '견종 고유 ID',
    field: 'breed_id'
  },
  
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '견종명'
  },
  
  icon_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '견종별 프로필 아이콘 URL'
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
  tableName: 'breeds',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['name']
    }
  ]
});

module.exports = Breed;
