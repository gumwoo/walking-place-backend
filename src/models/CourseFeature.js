const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CourseFeature = sequelize.define('CourseFeature', {
  feature_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    comment: '코스 특징 고유 ID',
    field: 'feature_id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '특징명 (예: 물가, 흙길, 벤치, 넓은 공간 등)'
  },
  is_custom: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '사용자가 직접 입력한 특징인지 여부',
    field: 'is_custom'
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
  tableName: 'course_features',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  comment: '코스 특징 테이블',
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      fields: ['is_custom']
    }
  ]
});

module.exports = CourseFeature;
