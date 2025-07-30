const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Breed = sequelize.define('Breed', {
  breedId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    comment: '견종 고유 ID'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '견종명'
  },
  iconUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '견종별 프로필 아이콘 URL'
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
  tableName: 'breeds',
  timestamps: true,
  comment: '견종 정보 테이블',
  indexes: [
    {
      unique: true,
      fields: ['name']
    }
  ]
});

module.exports = Breed;
