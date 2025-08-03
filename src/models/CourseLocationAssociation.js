const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CourseLocationAssociation = sequelize.define('CourseLocationAssociation', {
  course_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    comment: '코스 ID',
    field: 'course_id'
  },
  location_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    comment: '위치 ID',
    field: 'location_id'
  },
  is_start_point: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '해당 위치가 코스 시작점인지 여부',
    field: 'is_start_point'
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
      fields: ['is_start_point']
    }
  ]
});

module.exports = CourseLocationAssociation;
