const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CourseCourseFeature = sequelize.define('CourseCourseFeature', {
  courseId: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    comment: '코스 ID'
  },
  featureId: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    comment: '특징 ID'
  }
}, {
  tableName: 'course_course_features',
  timestamps: false,
  comment: '코스-특징 연결 테이블',
  indexes: [
    {
      fields: ['courseId']
    },
    {
      fields: ['featureId']
    }
  ]
});

module.exports = CourseCourseFeature;
