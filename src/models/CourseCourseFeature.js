const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CourseCourseFeature = sequelize.define('CourseCourseFeature', {
  course_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    comment: '코스 ID',
    field: 'course_id'
  },
  feature_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    comment: '특징 ID',
    field: 'feature_id'
  }
}, {
  tableName: 'course_course_features',
  timestamps: false,
  comment: '코스-특징 연결 테이블',
  indexes: [
    {
      fields: ['course_id']
    },
    {
      fields: ['feature_id']
    }
  ]
});

module.exports = CourseCourseFeature;
