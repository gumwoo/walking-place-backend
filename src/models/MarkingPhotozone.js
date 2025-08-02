const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MarkingPhotozone = sequelize.define('MarkingPhotozone', {
  photozoneId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    comment: '마킹 포토존 고유 ID'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    comment: '포토존 위도'
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    comment: '포토존 경도'
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: '코스 ID (특정 코스에 속하지 않을 수 있음)'
  },
  isRecommended: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '추천 포토존 여부'
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
  tableName: 'marking_photozones',
  timestamps: true,
  comment: '마킹 포토존 테이블',
  indexes: [
    {
      fields: ['course_id']
    },
    {
      fields: ['is_recommended']
    },
    {
      fields: ['latitude', 'longitude']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = MarkingPhotozone;
