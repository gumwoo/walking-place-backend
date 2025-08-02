const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CourseFeature = sequelize.define('CourseFeature', {
  featureId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    comment: '코스 특징 고유 ID'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '특징명 (예: 물가, 흙길, 벤치, 넓은 공간 등)'
  },
  isCustom: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '사용자가 직접 입력한 특징인지 여부'
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
  tableName: 'course_features',
  timestamps: true,
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
