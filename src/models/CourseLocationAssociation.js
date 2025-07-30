const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CourseLocationAssociation = sequelize.define('CourseLocationAssociation', {
  courseId: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    comment: '코스 ID'
  },
  locationId: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    comment: '위치 ID'
  },
  isStartPoint: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '해당 위치가 코스 시작점인지 여부',
    field: 'is_startpoint'
  }
}, {
  tableName: 'course_location_associations',
  timestamps: false,
  comment: '코스-위치 연관 테이블',
  indexes: [
    {
      fields: ['course_id']
    },
    {
      fields: ['location_id']
    },
    {
      fields: ['is_startpoint']
    }
  ]
});

module.exports = CourseLocationAssociation;
