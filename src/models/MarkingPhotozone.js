const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MarkingPhotozone = sequelize.define('MarkingPhotozone', {
  photozone_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    comment: '마킹 포토존 고유 ID',
    field: 'photozone_id'
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
  course_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: '코스 ID (특정 코스에 속하지 않을 수 있음)',
    field: 'course_id'
  },
  is_recommended: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '추천 포토존 여부',
    field: 'is_recommended'
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
  tableName: 'marking_photozones',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
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
