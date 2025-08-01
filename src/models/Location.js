const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  address_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '지번/도로명 주소'
  },
  
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    comment: '위도'
  },
  
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    comment: '경도'
  },
  
  area_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '동네 이름'
  },
  
  city: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '시/군/구'
  },
  
  province: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '도/특별시'
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
  tableName: 'locations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['address_name']
    },
    {
      fields: ['area_name']
    },
    {
      fields: ['city']
    }
  ]
});

module.exports = Location;
