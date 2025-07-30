const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Location = sequelize.define('Location', {
  locationId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    comment: '위치 고유 ID'
  },
  addressName: {
    type: DataTypes.STRING,
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
  areaName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '동네 이름',
    field: 'area_name'
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '시/군/구'
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '도/특별시'
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
  tableName: 'locations',
  timestamps: true,
  comment: '위치 정보 테이블',
  indexes: [
    {
      fields: ['area_name']
    },
    {
      fields: ['city']
    },
    {
      fields: ['province']
    },
    {
      fields: ['latitude', 'longitude']
    }
  ]
});

module.exports = Location;
